import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIService } from '../services/ai.service';

const prisma = new PrismaClient();

// Contact masking regexes
export const maskContactDetails = (text: string): string => {
  if (!text) return text;
  // Indian phone numbers (+91, 10 digits starting with 6-9, optional spaces/hyphens), general 7-12 digits
  const phoneRegex = /(\+?91[\-\s]?)?[6-9]\d{9}|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  // Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  // External links / URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(?:com|org|net|in|co|io|dev|app)(?:\/[^\s]*)?)/gi;

  return text
    .replace(emailRegex, '[contact hidden until deal is confirmed]')
    .replace(phoneRegex, '[contact hidden until deal is confirmed]')
    .replace(urlRegex, '[contact hidden until deal is confirmed]');
};

// Helper to determine stage/status chip
const getChatStage = (chat: any): 'Enquiry' | 'Quoted' | 'Confirmed' | 'Completed' => {
  if (!chat.requirement) return 'Enquiry';
  const orders = chat.requirement.orders || [];
  if (orders.some((o: any) => o.status === 'COMPLETED') || chat.requirement.status === 'COMPLETED') {
    return 'Completed';
  }
  if (orders.some((o: any) => ['ACCEPTED', 'IN_PROGRESS', 'DELIVERED'].includes(o.status))) {
    return 'Confirmed';
  }
  const quotes = chat.requirement.quotations || [];
  if (quotes.some((q: any) => q.workerId === chat.workerId)) {
    return 'Quoted';
  }
  return 'Enquiry';
};

// GET /api/chats - Fetch all conversations for the authenticated user
export const getMyChats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.user.userId;

    // Lookup worker profile if user is a worker
    const workerProfile = await prisma.workerProfile.findUnique({ where: { userId } });
    const workerId = workerProfile?.id;

    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { customerId: userId },
          ...(workerId ? [{ workerId }] : []),
        ],
      },
      include: {
        requirement: {
          include: {
            category: true,
            orders: { select: { id: true, status: true, orderNumber: true, totalAmount: true } },
            quotations: { select: { id: true, workerId: true, status: true, totalPrice: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const populated = await Promise.all(
      chats.map(async (c) => {
        const customer = await prisma.user.findUnique({
          where: { id: c.customerId },
          select: { id: true, name: true, avatarUrl: true, city: true, role: true },
        });

        const worker = await prisma.workerProfile.findUnique({
          where: { id: c.workerId },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, city: true, role: true } },
          },
        });

        // Unread messages for the current user
        const unreadCount = c.messages.filter(
          (m) => m.senderId !== userId && !m.isRead
        ).length;

        const isDealAccepted = Boolean(
          c.requirement?.orders && c.requirement.orders.some((o: any) => o.status !== 'CANCELLED')
        );

        const isDealCompleted = Boolean(
          c.requirement?.status === 'COMPLETED' ||
          (c.requirement?.orders && c.requirement.orders.some((o: any) => o.status === 'COMPLETED'))
        );

        const stage = getChatStage(c);
        const lastMessage = c.messages[0] || null;

        // Mask last message if deal not accepted
        let maskedLastMessage = null;
        if (lastMessage) {
          maskedLastMessage = {
            ...lastMessage,
            text: !isDealAccepted ? maskContactDetails(lastMessage.text) : lastMessage.text,
          };
        }

        return {
          id: c.id,
          requirementId: c.requirementId,
          customerId: c.customerId,
          workerId: c.workerId,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          requirement: c.requirement,
          customer,
          worker,
          unreadCount,
          stage,
          isDealAccepted,
          isDealCompleted,
          lastMessage: maskedLastMessage,
        };
      })
    );

    return res.json({ success: true, chats: populated });
  } catch (error: any) {
    console.error('getMyChats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chats.' });
  }
};

// POST /api/chats/get-or-create - Get existing chat or atomically create one (no duplicates)
export const getOrCreateChat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let { requirementId, workerId, customerId, initialText } = req.body;

    // Resolve customer and worker IDs based on caller role
    if (req.user.role === 'CUSTOMER') {
      customerId = req.user.userId;
      if (!workerId) {
        return res.status(400).json({ success: false, message: 'workerId is required for customer.' });
      }
      // If workerId passed is a User id instead of WorkerProfile id, resolve it
      const profile = await prisma.workerProfile.findFirst({
        where: { OR: [{ id: workerId }, { userId: workerId }] },
      });
      if (profile) {
        workerId = profile.id;
      }
    } else if (req.user.role === 'WORKER') {
      const profile = await prisma.workerProfile.findUnique({
        where: { userId: req.user.userId },
      });
      if (!profile) {
        return res.status(403).json({ success: false, message: 'Worker profile not found.' });
      }
      workerId = profile.id;

      if (!customerId && requirementId) {
        const reqDoc = await prisma.requirement.findUnique({ where: { id: requirementId } });
        if (reqDoc) customerId = reqDoc.customerId;
      }
      if (!customerId) {
        return res.status(400).json({ success: false, message: 'customerId or requirementId is required.' });
      }
    } else if (req.user.role === 'ADMIN') {
      if (!customerId || !workerId) {
        return res.status(400).json({ success: false, message: 'customerId and workerId required for admin.' });
      }
    }

    // Try finding existing chat
    let chat = await prisma.chat.findFirst({
      where: {
        customerId,
        workerId,
        ...(requirementId ? { requirementId } : {}),
      },
      include: {
        requirement: {
          include: {
            category: true,
            orders: { select: { id: true, status: true, orderNumber: true, totalAmount: true } },
            quotations: { select: { id: true, workerId: true, status: true, totalPrice: true } },
          },
        },
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          customerId,
          workerId,
          requirementId: requirementId || null,
        },
        include: {
          requirement: {
            include: {
              category: true,
              orders: { select: { id: true, status: true, orderNumber: true, totalAmount: true } },
              quotations: { select: { id: true, workerId: true, status: true, totalPrice: true } },
            },
          },
        },
      });

      // If initial text is provided, create first message
      if (initialText && initialText.trim()) {
        await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: req.user.userId,
            text: initialText.trim(),
            isMasked: true,
          },
        });
      }
    }

    const customer = await prisma.user.findUnique({
      where: { id: chat.customerId },
      select: { id: true, name: true, avatarUrl: true, city: true, role: true },
    });

    const worker = await prisma.workerProfile.findUnique({
      where: { id: chat.workerId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, city: true, role: true } },
      },
    });

    const isDealAccepted = Boolean(
      chat.requirement?.orders && chat.requirement.orders.some((o: any) => o.status !== 'CANCELLED')
    );

    const isDealCompleted = Boolean(
      chat.requirement?.status === 'COMPLETED' ||
      (chat.requirement?.orders && chat.requirement.orders.some((o: any) => o.status === 'COMPLETED'))
    );

    const stage = getChatStage(chat);

    return res.status(200).json({
      success: true,
      chat: {
        ...chat,
        customer,
        worker,
        stage,
        isDealAccepted,
        isDealCompleted,
      },
    });
  } catch (error: any) {
    console.error('getOrCreateChat error:', error);
    return res.status(500).json({ success: false, message: 'Failed to initialize conversation.' });
  }
};

// GET /api/chats/:chatId/messages - Fetch messages with authorization & contact masking
export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { chatId } = req.params;
    const { translateTo } = req.query; // 'en' | 'hi' | 'ml'
    const userId = req.user.userId;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        requirement: {
          include: {
            category: true,
            orders: { select: { id: true, status: true, orderNumber: true, totalAmount: true } },
          },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found.' });
    }

    // Verify caller is customer, worker participant, or admin
    let isAuthorized = req.user.role === 'ADMIN';
    if (!isAuthorized) {
      if (chat.customerId === userId) {
        isAuthorized = true;
      } else {
        const workerProfile = await prisma.workerProfile.findUnique({ where: { userId } });
        if (workerProfile && workerProfile.id === chat.workerId) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access forbidden: You are not a participant in this conversation.' });
    }

    // Mark unread messages sent by others as read
    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Check if requirement has an accepted order (deals in Escrow)
    const isDealAccepted = Boolean(
      chat.requirement?.orders && chat.requirement.orders.some((o: any) => o.status !== 'CANCELLED')
    );

    const isDealCompleted = Boolean(
      chat.requirement?.status === 'COMPLETED' ||
      (chat.requirement?.orders && chat.requirement.orders.some((o: any) => o.status === 'COMPLETED'))
    );

    const processedMessages = messages.map((m) => {
      let text = m.text;
      // Mask phone, emails and external links if deal is not yet accepted
      if (!isDealAccepted) {
        text = maskContactDetails(text);
      }

      let translated = m.translatedText;
      if (translateTo && typeof translateTo === 'string' && ['en', 'hi', 'ml'].includes(translateTo)) {
        const tr = AIService.translateMessage(text, translateTo as any);
        translated = tr.translated;
      }

      return {
        ...m,
        text,
        translatedText: translated,
      };
    });

    return res.json({
      success: true,
      messages: processedMessages,
      isDealAccepted,
      isDealCompleted,
    });
  } catch (error: any) {
    console.error('getChatMessages error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

// POST /api/chats/:chatId/messages - Send a new message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { chatId } = req.params;
    const { text, fileUrl } = req.body;
    const userId = req.user.userId;

    const trimmedText = typeof text === 'string' ? text.trim() : '';
    if (!trimmedText && !fileUrl) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        requirement: {
          include: {
            orders: { select: { id: true, status: true } },
          },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found.' });
    }

    // Verify caller is a participant (or admin)
    let isAuthorized = req.user.role === 'ADMIN';
    let workerProfile = null;
    if (!isAuthorized) {
      if (chat.customerId === userId) {
        isAuthorized = true;
      } else {
        workerProfile = await prisma.workerProfile.findUnique({ where: { userId } });
        if (workerProfile && workerProfile.id === chat.workerId) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access forbidden: You are not a participant in this conversation.' });
    }

    // Check if deal is completed -> read-only
    const isCompleted = Boolean(
      chat.requirement?.status === 'COMPLETED' ||
      (chat.requirement?.orders && chat.requirement.orders.some((o: any) => o.status === 'COMPLETED'))
    );

    if (isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'This deal is completed. Conversation is now read-only.',
      });
    }

    // Determine if deal accepted for masking
    const isDealAccepted = Boolean(
      chat.requirement?.orders && chat.requirement.orders.some((o: any) => o.status !== 'CANCELLED')
    );

    // Save message to database
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        text: trimmedText,
        fileUrl: fileUrl || null,
        isMasked: !isDealAccepted,
      },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });

    // Update conversation timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Prepare message with masking if applicable
    const deliveredMessage = {
      ...message,
      text: !isDealAccepted ? maskContactDetails(message.text) : message.text,
    };

    // Find recipient user ID for direct notification
    let recipientUserId = chat.customerId;
    if (chat.customerId === userId) {
      const wp = await prisma.workerProfile.findUnique({
        where: { id: chat.workerId },
        select: { userId: true },
      });
      if (wp) recipientUserId = wp.userId;
    }

    // Emit via Socket.io
    const io = req.app.get('io');
    if (io) {
      // Room emissions
      io.to(`chat:${chatId}`).emit('new_message', deliveredMessage);
      io.to(`conversation:${chatId}`).emit('new_message', deliveredMessage);

      // In-app real-time notification to the other participant
      io.to(`user:${recipientUserId}`).emit('chat_notification', {
        chatId,
        senderName: req.user.name,
        message: deliveredMessage,
      });
    }

    return res.status(201).json({
      success: true,
      message: deliveredMessage,
    });
  } catch (error: any) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};

// PUT /api/chats/:chatId/read - Mark messages as read
export const markMessagesAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { chatId } = req.params;
    const userId = req.user.userId;

    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${chatId}`).emit('messages_read', { chatId, readerId: userId });
      io.to(`conversation:${chatId}`).emit('messages_read', { chatId, readerId: userId });
    }

    return res.json({ success: true, message: 'Messages marked as read.' });
  } catch (error: any) {
    console.error('markMessagesAsRead error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark messages as read.' });
  }
};
