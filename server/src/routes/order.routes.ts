import { Router } from 'express';
import {
  getOrderById,
  updateMilestoneProgress,
  approveMilestone,
  updateDeliveryProof,
  createReview,
  fileDispute,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/:id', authenticate, getOrderById);
router.put('/:orderId/milestones/:milestoneId/progress', authenticate, updateMilestoneProgress);
router.put('/:orderId/milestones/:milestoneId/approve', authenticate, approveMilestone);
router.put('/:orderId/delivery-proof', authenticate, updateDeliveryProof);
router.post('/review', authenticate, createReview);
router.post('/dispute', authenticate, fileDispute);

export default router;
