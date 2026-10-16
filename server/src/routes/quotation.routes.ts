import { Router } from 'express';
import {
  submitQuotation,
  acceptQuotation,
  negotiateQuotation,
  getWorkerQuotations,
} from '../controllers/quotation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, submitQuotation);
router.get('/my-quotations', authenticate, getWorkerQuotations);
router.put('/:id/accept', authenticate, acceptQuotation);
router.put('/:id/negotiate', authenticate, negotiateQuotation);

export default router;
