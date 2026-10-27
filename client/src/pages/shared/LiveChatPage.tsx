import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusDot } from '../../components/ui/StatusDot';
import { Modal } from '../../components/ui/Modal';
import {
  Send,
  Paperclip,
  Languages,
  Lock,
  CheckCheck,
  Check,
  CheckCircle2,
  Search,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  X,
  AlertCircle,
  Clock,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  sender?: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
  text: string;
  translatedText?: string | null;
  fileUrl?: string | null;
  isMasked?: boolean;
  isRead?: boolean;
  createdAt: string;
  failed?: boolean;
  isOptimistic?: boolean;
}

export const LiveChatPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, isConnected, joinChat, leaveChat, sendTyping } = useSocket();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [translateLang, setTranslateLang] = useState<'en' | 'hi' | 'ml'>('en');
  const [isDealAccepted, setIsDealAccepted] = useState(false);
  const [isDealCompleted, setIsDealCompleted] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const [imagePreviewModalUrl, setImagePreviewModalUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Parse query params (dealId, workerId, customerId, chatId)
  const queryParams = new URLSearchParams(location.search);
  const qChatId = queryParams.get('chatId');
  const qDealId = queryParams.get('dealId');
  const qWorkerId = queryParams.get('workerId');
  const qCustomerId = queryParams.get('customerId');

  // Load all chats & handle get-or-create if query params exist
  const loadChats = useCallback(async () => {
    setIsLoadingChats(true);
    const token = localStorage.getItem('dd_token');
    try {
      // 1. If dealId + (workerId or customerId) provided in URL, call get-or-create first
      let targetChatId = qChatId;
      if (qDealId && (qWorkerId || qCustomerId || user?.role === 'WORKER')) {
        const getOrCreateRes = await fetch('/api/chats/get-or-create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requirementId: qDealId,
            workerId: qWorkerId,
            customerId: qCustomerId,
          }),
        });
        const getOrCreateData = await getOrCreateRes.json();
        if (getOrCreateData.success && getOrCreateData.chat) {
          targetChatId = getOrCreateData.chat.id;
        }
      } else if (qWorkerId && user?.role === 'CUSTOMER') {
        // Direct artisan chat
        const getOrCreateRes = await fetch('/api/chats/get-or-create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ workerId: qWorkerId }),
        });
        const getOrCreateData = await getOrCreateRes.json();
        if (getOrCreateData.success && getOrCreateData.chat) {
          targetChatId = getOrCreateData.chat.id;
        }
      }

      // 2. Fetch full conversation list
      const res = await fetch('/api/chats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const chatList = data.chats || [];
        setChats(chatList);

        if (chatList.length > 0) {
          if (targetChatId) {
            const found = chatList.find((c: any) => c.id === targetChatId);
            setActiveChat(found || chatList[0]);
          } else {
            setActiveChat((prev: any) => (prev ? chatList.find((c: any) => c.id === prev.id) || chatList[0] : chatList[0]));
          }
        } else {
          setActiveChat(null);
        }
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
      toast.error('Failed to load conversation history.');
    } finally {
      setIsLoadingChats(false);
    }
  }, [qChatId, qDealId, qWorkerId, qCustomerId, user?.role]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Load messages whenever activeChat or translateLang changes
  useEffect(() => {
    if (!activeChat?.id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const token = localStorage.getItem('dd_token');
        const res = await fetch(
          `/api/chats/${activeChat.id}/messages?translateTo=${translateLang}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages || []);
          setIsDealAccepted(Boolean(data.isDealAccepted));
          setIsDealCompleted(Boolean(data.isDealCompleted));

          // Reset unread count for active chat in left list
          setChats((prev) =>
            prev.map((c) => (c.id === activeChat.id ? { ...c, unreadCount: 0 } : c))
          );
        } else {
          toast.error(data.message || 'Unable to load messages.');
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    // Join room
    joinChat(activeChat.id);

    return () => {
      leaveChat(activeChat.id);
    };
  }, [activeChat?.id, translateLang, joinChat, leaveChat]);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherTyping]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessage) => {
      if (activeChat && msg.chatId === activeChat.id) {
        setMessages((prev) => {
          // Avoid duplicate if optimistic message matches
          const exists = prev.some((m) => m.id === msg.id || (m.isOptimistic && m.text === msg.text));
          if (exists) {
            return prev.map((m) => (m.isOptimistic && m.text === msg.text ? msg : m));
          }
          return [...prev, msg];
        });

        // Mark as read in backend
        const token = localStorage.getItem('dd_token');
        fetch(`/api/chats/${activeChat.id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }

      // Update chats list item
      setChats((prev) => {
        const index = prev.findIndex((c) => c.id === msg.chatId);
        if (index === -1) return prev;
        const updatedChat = {
          ...prev[index],
          lastMessage: msg,
          updatedAt: msg.createdAt,
          unreadCount:
            activeChat?.id === msg.chatId || msg.senderId === user?.id
              ? prev[index].unreadCount
              : (prev[index].unreadCount || 0) + 1,
        };
        const rest = prev.filter((_, i) => i !== index);
        return [updatedChat, ...rest];
      });
    };

    const handleUserTyping = (data: { chatId: string; userName?: string; isTyping: boolean }) => {
      if (activeChat && data.chatId === activeChat.id) {
        setIsOtherTyping(Boolean(data.isTyping));
      }
    };

    const handleMessagesRead = (data: { chatId: string; readerId: string }) => {
      if (activeChat && data.chatId === activeChat.id) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === user?.id ? { ...m, isRead: true } : m))
        );
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, activeChat, user?.id]);

  // Handle Input change & emit typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (activeChat) {
      sendTyping(activeChat.id, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(activeChat.id, false);
      }, 1500);
    }
  };

  // File Upload Handler (Images & PDFs up to 10MB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10 MB limit.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('dd_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAttachedFile({
          url: data.fileUrl,
          name: data.fileName || file.name,
          type: file.type.startsWith('image/') ? 'image' : 'pdf',
        });
        toast.success(`Attached ${file.name}`);
      } else {
        toast.error(data.message || 'Upload failed.');
      }
    } catch (err) {
      toast.error('Failed to upload file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Send Message Handler
  const handleSendMessage = async (e?: React.FormEvent, retryMessage?: ChatMessage) => {
    if (e) e.preventDefault();
    if (!activeChat) return;

    const textToSend = retryMessage ? retryMessage.text : inputText.trim();
    const fileUrlToSend = retryMessage ? retryMessage.fileUrl : attachedFile?.url || null;

    if (!textToSend && !fileUrlToSend) return;

    if (isDealCompleted) {
      toast.error('This project is completed. Conversation is read-only.');
      return;
    }

    // Stop typing indicator
    sendTyping(activeChat.id, false);

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: retryMessage ? retryMessage.id : tempId,
      chatId: activeChat.id,
      senderId: user?.id || '',
      sender: {
        id: user?.id || '',
        name: user?.name || 'Me',
        role: user?.role || 'CUSTOMER',
        avatarUrl: user?.avatarUrl,
      },
      text: textToSend,
      fileUrl: fileUrlToSend,
      isRead: false,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      failed: false,
    };

    if (!retryMessage) {
      setMessages((prev) => [...prev, optimisticMsg]);
      setInputText('');
      setAttachedFile(null);
    } else {
      setMessages((prev) =>
        prev.map((m) => (m.id === retryMessage.id ? { ...m, failed: false, isOptimistic: true } : m))
      );
    }

    const token = localStorage.getItem('dd_token');
    try {
      const res = await fetch(`/api/chats/${activeChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: textToSend,
          fileUrl: fileUrlToSend,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        // Replace optimistic message with actual persisted record
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMsg.id || (m.isOptimistic && m.text === textToSend)
              ? data.message
              : m
          )
        );

        // Update conversation in sidebar
        setChats((prev) => {
          const index = prev.findIndex((c) => c.id === activeChat.id);
          if (index === -1) return prev;
          const updatedChat = {
            ...prev[index],
            lastMessage: data.message,
            updatedAt: data.message.createdAt,
          };
          const rest = prev.filter((_, i) => i !== index);
          return [updatedChat, ...rest];
        });
      } else {
        toast.error(data.message || 'Failed to send message.');
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? { ...m, failed: true } : m))
        );
      }
    } catch (err) {
      console.error('Send error:', err);
      toast.error('Network error sending message.');
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? { ...m, failed: true } : m))
      );
    }
  };

  // Keyboard navigation: Enter sends, Shift+Enter makes newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations
  const filteredChats = chats.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherName = (user?.role === 'CUSTOMER' ? c.worker?.user?.name : c.customer?.name) || '';
    const dealTitle = c.requirement?.title || '';
    return otherName.toLowerCase().includes(q) || dealTitle.toLowerCase().includes(q);
  });

  // Details for current active conversation
  const otherPerson =
    user?.role === 'CUSTOMER'
      ? {
          name: activeChat?.worker?.user?.name || 'Verified Artisan',
          role: 'Artisan',
          avatar: activeChat?.worker?.user?.avatarUrl,
          city: activeChat?.worker?.user?.city,
        }
      : {
          name: activeChat?.customer?.name || 'Client',
          role: 'Customer',
          avatar: activeChat?.customer?.avatarUrl,
          city: activeChat?.customer?.city,
        };

  // Stage chip badge styling
  const renderStageBadge = (stage: string) => {
    switch (stage) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Confirmed':
        return <Badge variant="orange">Confirmed</Badge>;
      case 'Quoted':
        return <Badge variant="verified">Quoted</Badge>;
      default:
        return <Badge variant="default">Enquiry</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-130px)] flex flex-col md:flex-row border border-[#D9D9D9] rounded-nothing overflow-hidden bg-white shadow-sm">
      {/* LEFT PANEL: CONVERSATIONS LIST */}
      <div className="w-full md:w-80 bg-white border-r border-[#D9D9D9] flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-[#D9D9D9] flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A0A0A]">
            CONVERSATIONS ({chats.length})
          </h2>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
            <StatusDot status={isConnected ? 'active' : 'idle'} size="sm" />
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-[#E5E5E5] bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D9D9D9] text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E5]">
          {isLoadingChats ? (
            <div className="p-4 space-y-3">
              <div className="h-14 bg-neutral-100 animate-pulse" />
              <div className="h-14 bg-neutral-100 animate-pulse" />
              <div className="h-14 bg-neutral-100 animate-pulse" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <Clock className="w-10 h-10 text-neutral-300 mb-2" />
              <p className="text-xs font-mono font-bold text-neutral-700">No conversations yet</p>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px] leading-relaxed">
                {user?.role === 'CUSTOMER'
                  ? 'Browse verified artisans or check quotations on your deals to start a chat.'
                  : 'Browse customer requirements and submit quotes to initiate client chats.'}
              </p>
              {user?.role === 'CUSTOMER' ? (
                <Link to="/customer/workers" className="mt-4">
                  <Button variant="outline" size="sm">Browse Artisans</Button>
                </Link>
              ) : (
                <Link to="/worker/feed" className="mt-4">
                  <Button variant="outline" size="sm">Browse Feed</Button>
                </Link>
              )}
            </div>
          ) : (
            filteredChats.map((c) => {
              const isSelected = activeChat?.id === c.id;
              const displayName =
                user?.role === 'CUSTOMER'
                  ? c.worker?.user?.name || 'Artisan'
                  : c.customer?.name || 'Client';
              const avatar =
                user?.role === 'CUSTOMER'
                  ? c.worker?.user?.avatarUrl
                  : c.customer?.avatarUrl;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveChat(c)}
                  className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 border-l-4 ${
                    isSelected
                      ? 'bg-neutral-50/80 border-l-[#FF5A1F]'
                      : 'border-l-transparent hover:bg-neutral-50'
                  }`}
                >
                  <img
                    src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover border border-[#D9D9D9] shrink-0"
                  />
                  <div className="overflow-hidden flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-[#0A0A0A] truncate">
                        {displayName}
                      </h4>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-neutral-600 truncate mb-1">
                      {c.requirement?.title || 'Direct Artisan Enquiry'}
                    </p>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] text-neutral-400 truncate max-w-[130px]">
                        {c.lastMessage?.text || 'Conversation initiated'}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {renderStageBadge(c.stage)}
                        {Boolean(c.unreadCount) && (
                          <span className="w-4 h-4 rounded-full bg-[#FF5A1F] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: ACTIVE CHAT CONVERSATION */}
      <div className="flex-1 flex flex-col bg-white">
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-[#FF5A1F]" />
            </div>
            <h3 className="text-base font-bold text-[#0A0A0A] mb-1">Select a Conversation</h3>
            <p className="text-xs text-[#4A4A4A] max-w-sm font-normal">
              Choose a thread from the list on the left to review quotations, communicate project specifications, or share milestone photos.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-3.5 border-b border-[#D9D9D9] flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-3">
                <img
                  src={otherPerson.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                  alt={otherPerson.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#D9D9D9]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0A0A0A]">{otherPerson.name}</h3>
                    <Badge variant={otherPerson.role === 'Artisan' ? 'orange' : 'verified'}>
                      {otherPerson.role}
                    </Badge>
                  </div>
                  {activeChat.requirement && (
                    <Link
                      to={
                        user?.role === 'CUSTOMER'
                          ? `/customer/deals/${activeChat.requirement.id}`
                          : `/worker/feed`
                      }
                      className="text-[11px] font-mono text-neutral-500 hover:text-black flex items-center gap-1 mt-0.5"
                    >
                      <span>Project: {activeChat.requirement.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-[#FF5A1F]" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Translation Controls & Escrow Protection Badge */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-neutral-50 border border-[#D9D9D9] px-2 py-1 text-xs font-mono">
                  <Languages className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span className="text-[10px] text-neutral-400">Translate:</span>
                  {(['en', 'hi', 'ml'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setTranslateLang(l)}
                      className={`px-1.5 py-0.2 uppercase transition-all ${
                        translateLang === l
                          ? 'bg-black text-white font-bold'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Status / Contact Protection Notice Banner */}
            {isDealCompleted ? (
              <div className="px-4 py-2 bg-neutral-100 text-neutral-700 border-b border-neutral-200 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>This deal is marked completed. Conversation is archived and read-only.</span>
              </div>
            ) : isDealAccepted ? (
              <div className="px-4 py-2 bg-emerald-50 text-emerald-900 border-b border-emerald-200 text-xs font-mono flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Escrow Protected: Deal confirmed. Direct contact and site addresses are unlocked.</span>
              </div>
            ) : (
              <div className="px-4 py-2 bg-amber-50 text-amber-900 border-b border-amber-200 text-xs font-mono flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0" />
                <span>
                  Escrow Protection Active: Phone numbers, emails, and links are hidden until the quotation is accepted into platform escrow.
                </span>
              </div>
            )}

            {/* Messages Stream */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white">
              {isLoadingMessages ? (
                <div className="space-y-3">
                  <div className="h-10 w-2/3 bg-neutral-100 animate-pulse" />
                  <div className="h-10 w-1/2 ml-auto bg-neutral-100 animate-pulse" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                  <Clock className="w-8 h-8 mb-2 text-neutral-300" />
                  <p className="text-xs font-mono">No messages in this conversation yet.</p>
                  <p className="text-[11px] mt-1 text-neutral-400">
                    Send a message to discuss project dimensions, pricing, or raw materials.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3 text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#FF5A1F] text-white shadow-xs rounded-none'
                            : 'bg-[#F5F5F5] text-[#0A0A0A] border border-[#D9D9D9] shadow-xs rounded-none'
                        }`}
                      >
                        {/* Attached File (Image or PDF) */}
                        {m.fileUrl && (
                          <div className="mb-2">
                            {m.fileUrl.match(/\.(jpeg|jpg|png|webp)$/i) ? (
                              <img
                                src={m.fileUrl}
                                alt="Attachment"
                                onClick={() => setImagePreviewModalUrl(m.fileUrl!)}
                                className="max-h-48 rounded-none object-cover cursor-pointer border border-black/10 hover:opacity-95"
                              />
                            ) : (
                              <a
                                href={m.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex items-center gap-2 p-2 border text-[11px] font-mono ${
                                  isMe
                                    ? 'bg-white/10 border-white/30 text-white'
                                    : 'bg-white border-[#D9D9D9] text-black hover:border-black'
                                }`}
                              >
                                <FileText className="w-4 h-4 shrink-0 text-[#FF5A1F]" />
                                <span className="truncate flex-1">
                                  {m.fileUrl.split('/').pop()}
                                </span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Text Content */}
                        {m.text && <p className="whitespace-pre-wrap">{m.translatedText || m.text}</p>}

                        {/* Translation Original Indicator */}
                        {m.translatedText && m.translatedText !== m.text && (
                          <span className={`block mt-1 pt-1 border-t text-[10px] font-mono italic ${
                            isMe ? 'border-white/20 text-white/80' : 'border-neutral-200 text-neutral-500'
                          }`}>
                            Original: "{m.text}"
                          </span>
                        )}
                      </div>

                      {/* Message Metadata (Timestamp, Checkmarks, Failed State) */}
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-[#4A4A4A]">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {isMe && (
                          m.failed ? (
                            <button
                              onClick={() => handleSendMessage(undefined, m)}
                              className="text-red-500 flex items-center gap-1 hover:underline font-bold"
                            >
                              <AlertCircle className="w-3 h-3" /> Failed. Tap to retry
                            </button>
                          ) : m.isRead ? (
                            <span title="Read"><CheckCheck className="w-3.5 h-3.5 text-[#10B981]" /></span>
                          ) : (
                            <span title="Delivered"><Check className="w-3 h-3 text-neutral-400" /></span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {isOtherTyping && (
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 italic">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-ping" />
                  <span>{otherPerson.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview Chip */}
            {attachedFile && (
              <div className="px-4 py-2 bg-neutral-50 border-t border-[#D9D9D9] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 truncate">
                  {attachedFile.type === 'image' ? (
                    <ImageIcon className="w-4 h-4 text-[#FF5A1F]" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#FF5A1F]" />
                  )}
                  <span className="text-neutral-800 truncate">{attachedFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 text-neutral-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Message Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-[#D9D9D9] bg-white flex items-center gap-2"
            >
              {/* File Attachment Input (hidden) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isDealCompleted || isUploading}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isDealCompleted || isUploading}
                className="p-2 border border-[#D9D9D9] hover:border-black text-[#4A4A4A] hover:text-black rounded-nothing transition-colors"
                title="Attach photo or PDF (max 10 MB)"
              >
                <Paperclip className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isDealCompleted}
                placeholder={
                  isDealCompleted
                    ? 'Project completed. Chat is read-only.'
                    : 'Type a message in English, Hindi, or Malayalam (Enter to send)...'
                }
                className="flex-1 bg-white border border-[#D9D9D9] px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-black disabled:bg-neutral-100 disabled:text-neutral-400"
              />

              <Button
                variant="orange"
                type="submit"
                size="sm"
                disabled={(!inputText.trim() && !attachedFile) || isDealCompleted}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </Button>
            </form>
          </>
        )}
      </div>

      {/* Full-Screen Image Preview Modal */}
      {imagePreviewModalUrl && (
        <Modal
          isOpen={Boolean(imagePreviewModalUrl)}
          onClose={() => setImagePreviewModalUrl(null)}
          title="IMAGE ATTACHMENT"
        >
          <div className="flex flex-col items-center">
            <img
              src={imagePreviewModalUrl}
              alt="Attachment full preview"
              className="max-h-[70vh] w-auto object-contain border border-[#D9D9D9]"
            />
            <div className="mt-4 flex justify-end w-full">
              <a
                href={imagePreviewModalUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-mono"
              >
                <ExternalLink className="w-3 h-3" /> Open in New Tab
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
