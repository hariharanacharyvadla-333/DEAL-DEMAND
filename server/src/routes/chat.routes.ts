import { Router } from 'express';
import {
  getMyChats,
  getOrCreateChat,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
} from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getMyChats);
router.post('/get-or-create', getOrCreateChat);
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/messages', sendMessage);
router.put('/:chatId/read', markMessagesAsRead);

export default router;
