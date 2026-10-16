import { Router } from 'express';
import {
  getWorkersDirectory,
  getWorkerProfileById,
  updateWorkerProfile,
  addPortfolioItem,
  uploadKYCDocument,
  requestPayout,
} from '../controllers/worker.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getWorkersDirectory);
router.get('/:id', getWorkerProfileById);
router.put('/profile', authenticate, updateWorkerProfile);
router.post('/portfolio', authenticate, addPortfolioItem);
router.post('/kyc', authenticate, uploadKYCDocument);
router.post('/payout', authenticate, requestPayout);

export default router;
