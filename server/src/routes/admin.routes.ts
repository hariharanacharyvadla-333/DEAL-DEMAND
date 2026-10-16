import { Router } from 'express';
import {
  getAdminStats,
  getVerificationQueue,
  updateWorkerVerification,
  getEscrowBoard,
  releaseEscrowAdmin,
  resolveDispute,
  addCategoryField,
} from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireRole(['ADMIN']));

router.get('/stats', getAdminStats);
router.get('/verifications', getVerificationQueue);
router.put('/verifications/:id', updateWorkerVerification);
router.get('/escrow-board', getEscrowBoard);
router.put('/escrow-release/:escrowId', releaseEscrowAdmin);
router.put('/disputes/:disputeId/resolve', resolveDispute);
router.post('/category-field', addCategoryField);

export default router;
