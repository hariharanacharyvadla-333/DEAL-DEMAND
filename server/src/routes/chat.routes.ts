import { Router } from 'express';
import { getMyChats, getChatMessages, sendMessage } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getMyChats);
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/messages', sendMessage);

export default router;
