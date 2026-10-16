import { Router } from 'express';
import { login, registerCustomer, registerWorker, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register-customer', registerCustomer);
router.post('/register-worker', registerWorker);
router.get('/me', authenticate, getMe);

export default router;
