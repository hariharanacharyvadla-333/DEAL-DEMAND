import { Router } from 'express';
import { getDeals, getMyDeals, getDealById, createDeal } from '../controllers/deal.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getDeals);
router.get('/my-deals', authenticate, getMyDeals);
router.get('/:id', getDealById);
router.post('/', authenticate, createDeal);

export default router;
