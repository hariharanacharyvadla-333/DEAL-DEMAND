import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        fields: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { workers: true, requirements: true } },
      },
      orderBy: { name: 'asc' },
    });

    return res.json({
      success: true,
      categories: categories.map((c) => ({
        ...c,
        workersCount: c._count.workers,
        requirementsCount: c._count.requirements,
      })),
    });
  } catch (error: any) {
    console.error('Category fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        fields: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.json({ success: true, category });
  } catch (error: any) {
    console.error('Category detail error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch category.' });
  }
});

export default router;
