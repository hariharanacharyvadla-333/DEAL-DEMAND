import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Import Routes
import authRouter from './routes/auth.routes';
import dealRouter from './routes/deal.routes';
import quotationRouter from './routes/quotation.routes';
import orderRouter from './routes/order.routes';
import workerRouter from './routes/worker.routes';
import adminRouter from './routes/admin.routes';
import chatRouter from './routes/chat.routes';
import aiRouter from './routes/ai.routes';
import categoryRouter from './routes/category.routes';
import uploadRouter from './routes/upload.routes';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Make io accessible in Express request controllers via req.app.get('io')
app.set('io', io);

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'deal-and-demand-dev-secret-key-2026';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/deals', dealRouter);
app.use('/api/quotations', quotationRouter);
app.use('/api/orders', orderRouter);
app.use('/api/workers', workerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chats', chatRouter);
app.use('/api/ai', aiRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/upload', uploadRouter);

// Public platform live stats endpoint (real counts from database)
app.get('/api/stats/public', async (_req, res) => {
  try {
    const activeDeals = await prisma.requirement.count({
      where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
    });
    const verifiedWorkers = await prisma.workerProfile.count({
      where: { verificationState: 'VERIFIED' },
    });
    const completedDeals = await prisma.requirement.count({
      where: { status: 'COMPLETED' },
    });
    const escrowAgg = await prisma.escrowTransaction.aggregate({
      where: { status: 'HELD' },
      _sum: { amountHeld: true },
    });

    return res.json({
      success: true,
      stats: {
        activeDeals,
        verifiedWorkers,
        completedDeals,
        escrowVolume: escrowAgg._sum.amountHeld || 0,
      },
    });
  } catch (error) {
    console.error('public stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch public stats' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'Deal&Demand API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Socket.io Real-Time Engine with JWT Handshake Auth
io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    (socket.handshake.headers?.authorization
      ? socket.handshake.headers.authorization.replace(/^Bearer\s+/i, '')
      : null);

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      socket.data.user = decoded;
    } catch (err) {
      console.warn(`Socket auth token verification failed:`, (err as Error).message);
    }
  }
  next();
});

io.on('connection', (socket) => {
  const user = socket.data.user;
  console.log(`⚡ Socket client connected: ${socket.id} (User: ${user?.name || 'Anonymous'})`);

  if (user?.userId) {
    socket.join(`user:${user.userId}`);
  }

  // Join chat room (both chat:id and conversation:id formats supported)
  socket.on('join_chat', async (chatId: string) => {
    if (!chatId) return;
    socket.join(`chat:${chatId}`);
    socket.join(`conversation:${chatId}`);
    console.log(`User ${user?.name || socket.id} joined chat room: ${chatId}`);
  });

  // Leave chat room
  socket.on('leave_chat', (chatId: string) => {
    if (!chatId) return;
    socket.leave(`chat:${chatId}`);
    socket.leave(`conversation:${chatId}`);
  });

  // Message sent event from client socket
  socket.on('send_message', (data: { chatId: string; message: any }) => {
    if (!data?.chatId) return;
    socket.to(`chat:${data.chatId}`).to(`conversation:${data.chatId}`).emit('new_message', data.message);
  });

  // Typing indicators
  socket.on('typing_start', (data: { chatId: string; userName?: string }) => {
    if (!data?.chatId) return;
    const userName = data.userName || user?.name || 'Participant';
    socket.to(`chat:${data.chatId}`).to(`conversation:${data.chatId}`).emit('user_typing', {
      chatId: data.chatId,
      userName,
      isTyping: true,
    });
  });

  socket.on('typing_stop', (data: { chatId: string }) => {
    if (!data?.chatId) return;
    socket.to(`chat:${data.chatId}`).to(`conversation:${data.chatId}`).emit('user_typing', {
      chatId: data.chatId,
      isTyping: false,
    });
  });

  // Real-time notification channel
  socket.on('join_user_channel', (userId: string) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Deal&Demand server listening on http://localhost:${PORT}`);
  console.log(`📡 WebSocket Real-Time engine initialized.`);
});
