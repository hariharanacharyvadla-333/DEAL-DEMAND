import { Router } from 'express';
import {
  getAdminStats,
  getVerificationQueue,
  updateWorkerVerification,
  getEscrowBoard,
  releaseEscrowAdmin,
  resolveDispute,
  addCategoryField,
  getDisputes,
  getDeliveries,
  getFlaggedItems,
  getUsers,
  toggleBlockUser,
  getAuditLogs,
  getOrderChatTranscript,
} from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireRole(['ADMIN']));

router.get('/stats', getAdminStats);
router.get('/verifications', getVerificationQueue);
router.put('/verifications/:id', updateWorkerVerification);
router.get('/escrow-board', getEscrowBoard);
router.put('/escrow-release/:escrowId', releaseEscrowAdmin);
router.get('/disputes', getDisputes);
router.put('/disputes/:disputeId/resolve', resolveDispute);
router.get('/deliveries', getDeliveries);
router.get('/flagged', getFlaggedItems);
router.post('/category-field', addCategoryField);

// User Management
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

// Dispute Chat Transcript (read-only)
router.get('/orders/:orderId/chat', getOrderChatTranscript);

export default router;
