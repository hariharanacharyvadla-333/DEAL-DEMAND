import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIService } from '../services/ai.service';

const prisma = new PrismaClient();

export const getMyChats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.user.userId;

    // Worker profile lookup if user is worker
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
        requirement: { include: { category: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Populate the other party details
    const populated = await Promise.all(
      chats.map(async (c) => {
        const customer = await prisma.user.findUnique({
          where: { id: c.customerId },
          select: { id: true, name: true, avatarUrl: true, city: true },
        });

        const worker = await prisma.workerProfile.findUnique({
          where: { id: c.workerId },
          include: { user: { select: { id: true, name: true, avatarUrl: true, city: true } } },
        });

        return {
          ...c,
          customer,
          worker,
          lastMessage: c.messages[0] || null,
        };
      })
    );

    return res.json({ success: true, chats: populated });
  } catch (error: any) {
    console.error('getMyChats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chats.' });
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { translateTo } = req.query; // 'en' | 'hi' | 'ml'

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        requirement: { include: { orders: true } },
      },
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found.' });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Check if requirement has an accepted order
    const isAccepted = chat.requirement?.orders && chat.requirement.orders.length > 0;

    const processedMessages = messages.map((m) => {
      let text = m.text;
      // Mask phone and emails if not yet accepted
      if (!isAccepted) {
        text = text.replace(/(\+?91[\-\s]?)?[6789]\d{9}/g, '[PHONE MASKED - Escrow Protected]');
        text = text.replace(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g, '[EMAIL MASKED - Escrow Protected]');
      }

      let translated = m.translatedText;
      if (translateTo && typeof translateTo === 'string') {
        const tr = AIService.translateMessage(text, translateTo as any);
        translated = tr.translated;
      }

      return {
        ...m,
        text,
        translatedText: translated,
      };
    });

    return res.json({ success: true, messages: processedMessages, isDealAccepted: Boolean(isAccepted) });
  } catch (error: any) {
    console.error('getChatMessages error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { chatId } = req.params;
    const { text, fileUrl } = req.body;

    if (!text && !fileUrl) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: req.user.userId,
        text: text || '',
        fileUrl: fileUrl || null,
        isMasked: false,
      },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({ success: true, message });
  } catch (error: any) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};
