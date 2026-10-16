import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

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

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const PORT = process.env.PORT || 5000;

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

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'Deal&Demand API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Socket.io Real-Time Engine
io.on('connection', (socket) => {
  console.log(`⚡ Socket client connected: ${socket.id}`);

  // Join chat room
  socket.on('join_chat', (chatId: string) => {
    socket.join(`chat:${chatId}`);
    console.log(`User joined chat room: chat:${chatId}`);
  });

  // Leave chat room
  socket.on('leave_chat', (chatId: string) => {
    socket.leave(`chat:${chatId}`);
  });

  // Message sent event
  socket.on('send_message', (data: { chatId: string; message: any }) => {
    // Broadcast to everyone in this chat room except sender
    socket.to(`chat:${data.chatId}`).emit('new_message', data.message);
  });

  // Typing indicators
  socket.on('typing_start', (data: { chatId: string; userName: string }) => {
    socket.to(`chat:${data.chatId}`).emit('user_typing', { userName: data.userName, isTyping: true });
  });

  socket.on('typing_stop', (data: { chatId: string }) => {
    socket.to(`chat:${data.chatId}`).emit('user_typing', { isTyping: false });
  });

  // Real-time notification broadcast
  socket.on('join_user_channel', (userId: string) => {
    socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Deal&Demand server listening on http://localhost:${PORT}`);
  console.log(`📡 WebSocket Real-Time engine initialized.`);
});
