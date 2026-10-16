import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusDot } from '../../components/ui/StatusDot';
import {
  Send,
  Paperclip,
  Languages,
  ShieldAlert,
  Lock,
  Smile,
  CheckCheck,
} from 'lucide-react';

export const LiveChatPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [translateLang, setTranslateLang] = useState<'en' | 'hi' | 'ml'>('en');
  const [isDealAccepted, setIsDealAccepted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chats on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const res = await fetch('/api/chats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.chats.length > 0) {
          setChats(data.chats);
          setActiveChat(data.chats[0]);
        }
      } catch (err) {
        console.error('Failed to load chats:', err);
      }
    };

    fetchChats();
  }, []);

  // Fetch messages when activeChat or translateLang changes
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const res = await fetch(`/api/chats/${activeChat.id}/messages?translateTo=${translateLang}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
          setIsDealAccepted(data.isDealAccepted);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    fetchMessages();

    // Join socket room
    if (socket && activeChat?.id) {
      socket.emit('join_chat', activeChat.id);
    }

    return () => {
      if (socket && activeChat?.id) {
        socket.emit('leave_chat', activeChat.id);
      }
    };
  }, [activeChat?.id, translateLang, socket]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socket.on('user_typing', (data: any) => {
      setIsTyping(Boolean(data.isTyping));
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
    };
  }, [socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const token = localStorage.getItem('dd_token');
    const textToSend = inputText;
    setInputText('');

    try {
      const res = await fetch(`/api/chats/${activeChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: textToSend }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        if (socket) {
          socket.emit('send_message', { chatId: activeChat.id, message: data.message });
        }
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const otherPersonName =
    user?.role === 'CUSTOMER'
      ? activeChat?.worker?.user?.name || 'Verified Artisan'
      : activeChat?.customer?.name || 'Client';

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row border border-neutral-200 rounded-nothing overflow-hidden bg-white shadow-sm">
      {/* Chats Threads Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-[#D9D9D9] flex flex-col shrink-0">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A]">
            CONVERSATIONS
          </h2>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
            <StatusDot status={isConnected ? 'active' : 'idle'} size="sm" />
            <span>{isConnected ? 'Real-time' : 'Offline'}</span>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {chats.map((c) => {
            const isSelected = activeChat?.id === c.id;
            const displayName = user?.role === 'CUSTOMER' ? c.worker?.user?.name : c.customer?.name;
            const avatar = user?.role === 'CUSTOMER' ? c.worker?.user?.avatarUrl : c.customer?.avatarUrl;

            return (
              <div
                key={c.id}
                onClick={() => setActiveChat(c)}
                className={`p-4 cursor-pointer transition-colors flex items-center gap-3 ${
                  isSelected ? 'bg-white border-l-4 border-[#FF5A1F]' : 'hover:bg-neutral-100'
                }`}
              >
                <img
                  src={avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80'}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200 shrink-0"
                />
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-[#0A0A0A] truncate">
                      {displayName}
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {c.requirement?.title || 'Requirement Discussion'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Box Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-[#0A0A0A]">
              {otherPersonName}
            </h3>
            <Badge variant="verified">SECURE ESCROW CHAT</Badge>
          </div>

          {/* Translation Control */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-[#FF5A1F]" /> Translate:
            </span>
            <div className="flex bg-white p-0.5 rounded-full border border-[#D9D9D9] text-xs font-mono shadow-2xs">
              {(['en', 'hi', 'ml'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setTranslateLang(l)}
                  className={`px-2 py-0.5 rounded-full uppercase transition-all ${
                    translateLang === l ? 'bg-black text-white font-bold' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Protection Banner */}
        {!isDealAccepted && (
          <div className="px-4 py-2.5 bg-amber-50 text-amber-900 border-b border-amber-200 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FF5A1F] shrink-0" />
              <span className="font-medium">Contact details remain protected until quotation is accepted into Escrow.</span>
            </div>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
          {messages.map((m) => {
            const isMe = m.senderId === user?.id;

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md p-3.5 rounded-nothing-sm text-sm leading-relaxed ${
                    isMe
                      ? 'bg-[#FF5A1F] text-white rounded-br-none shadow-xs font-medium'
                      : 'bg-white text-[#0A0A0A] border border-[#D9D9D9] rounded-bl-none shadow-xs'
                  }`}
                >
                  <p>{m.translatedText || m.text}</p>
                  {m.translatedText && m.translatedText !== m.text && (
                    <span className="block mt-1.5 text-xs text-white/90 font-mono italic">
                      Original: "{m.text}"
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-[#4A4A4A] mt-1 flex items-center gap-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#10B981]" />}
                </span>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 italic">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-ping" />
              <span>{otherPersonName} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-200 bg-white flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message in English, Hindi, or Malayalam..."
            className="flex-1 bg-white border border-[#D9D9D9] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-black"
          />

          <Button variant="orange" type="submit" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
