import { Router } from 'express';
import { expandRequirement, estimatePrice, summarizeQuotations, translateText } from '../controllers/ai.controller';

const router = Router();

router.post('/expand-requirement', expandRequirement);
router.post('/estimate-price', estimatePrice);
router.post('/summarize-quotations', summarizeQuotations);
router.post('/translate', translateText);

export default router;
