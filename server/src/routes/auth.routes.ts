import { Router } from 'express';
import {
  login,
  registerCustomer,
  registerWorker,
  getMe,
  updateLanguage,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);

// Customer Registration routes (support both styles)
router.post('/register/customer', registerCustomer);
router.post('/register-customer', registerCustomer);

// Worker Registration routes (support both styles)
router.post('/register/worker', registerWorker);
router.post('/register-worker', registerWorker);

// Session check
router.get('/me', authenticate, getMe);

// Language preference persistence
router.put('/profile/language', authenticate, updateLanguage);

export default router;
