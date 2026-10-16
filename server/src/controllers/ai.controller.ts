import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const expandRequirement = async (req: Request, res: Response) => {
  try {
    const { categorySlug, keywords, rawDetails } = req.body;
    const result = await AIService.expandRequirement(
      categorySlug || 'carpenter',
      keywords || '',
      rawDetails || {}
    );
    return res.json({ success: true, result });
  } catch (error: any) {
    console.error('expandRequirement error:', error);
    return res.status(500).json({ success: false, message: 'AI expansion failed.' });
  }
};

export const estimatePrice = async (req: Request, res: Response) => {
  try {
    const { categorySlug, specs } = req.body;
    const result = await AIService.estimatePrice(categorySlug || 'carpenter', specs || {});
    return res.json({ success: true, result });
  } catch (error: any) {
    console.error('estimatePrice error:', error);
    return res.status(500).json({ success: false, message: 'AI price estimation failed.' });
  }
};

export const summarizeQuotations = async (req: Request, res: Response) => {
  try {
    const { dealId } = req.body;

    const quotations = await prisma.quotation.findMany({
      where: { requirementId: dealId },
      include: {
        worker: { include: { user: true } },
      },
    });

    const mapped = quotations.map((q) => ({
      id: q.id,
      workerName: q.worker.user.name,
      totalPrice: q.totalPrice,
      timelineDays: q.timelineDays,
      warrantyMonths: q.warrantyMonths,
      rating: q.worker.rating,
    }));

    const result = AIService.summarizeQuotations(mapped);
    return res.json({ success: true, result });
  } catch (error: any) {
    console.error('summarizeQuotations error:', error);
    return res.status(500).json({ success: false, message: 'AI summary failed.' });
  }
};

export const translateText = async (req: Request, res: Response) => {
  try {
    const { text, targetLang } = req.body;
    const result = AIService.translateMessage(text || '', targetLang || 'en');
    return res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('translateText error:', error);
    return res.status(500).json({ success: false, message: 'Translation failed.' });
  }
};
