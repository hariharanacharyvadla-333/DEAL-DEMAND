import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getWorkersDirectory = async (req: Request, res: Response) => {
  try {
    const { category, city, rating, verifiedOnly, search } = req.query;

    const where: any = {};

    if (category) {
      where.categories = {
        some: { category: { slug: String(category) } },
      };
    }
    if (city) {
      where.serviceArea = { contains: String(city) };
    }
    if (rating) {
      where.rating = { gte: Number(rating) };
    }
    if (verifiedOnly === 'true') {
      where.verificationState = 'VERIFIED';
    }
    if (search) {
      where.OR = [
        { user: { name: { contains: String(search) } } },
        { tagline: { contains: String(search) } },
        { skills: { contains: String(search) } },
      ];
    }

    const workers = await prisma.workerProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, city: true, avatarUrl: true, createdAt: true } },
        categories: { include: { category: true } },
        portfolioItems: { take: 3 },
      },
      orderBy: [{ badgeLevel: 'desc' }, { rating: 'desc' }],
    });

    return res.json({ success: true, workers });
  } catch (error: any) {
    console.error('getWorkersDirectory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch workers.' });
  }
};

export const getWorkerProfileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const worker = await prisma.workerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, city: true, avatarUrl: true, phone: true, createdAt: true } },
        categories: { include: { category: true } },
        portfolioItems: true,
        kycDocuments: true,
        reviewsReceived: {
          include: { customer: { select: { id: true, name: true, city: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found.' });
    }

    return res.json({ success: true, worker });
  } catch (error: any) {
    console.error('getWorkerProfileById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch worker profile.' });
  }
};

export const updateWorkerProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { tagline, bio, yearsExperience, serviceArea, skills, bankUpiDetails } = req.body;

    const worker = await prisma.workerProfile.update({
      where: { userId: req.user.userId },
      data: {
        tagline: tagline !== undefined ? tagline : undefined,
        bio: bio !== undefined ? bio : undefined,
        yearsExperience: yearsExperience !== undefined ? Number(yearsExperience) : undefined,
        serviceArea: serviceArea !== undefined ? serviceArea : undefined,
        skills: skills !== undefined ? skills : undefined,
        bankUpiDetails: bankUpiDetails !== undefined ? (typeof bankUpiDetails === 'object' ? JSON.stringify(bankUpiDetails) : bankUpiDetails) : undefined,
      },
    });

    return res.json({ success: true, message: 'Profile updated successfully.', worker });
  } catch (error: any) {
    console.error('updateWorkerProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

export const addPortfolioItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const worker = await prisma.workerProfile.findUnique({ where: { userId: req.user.userId } });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    const { title, description, imageUrl, beforeImageUrl, category } = req.body;

    const item = await prisma.portfolioItem.create({
      data: {
        workerId: worker.id,
        title,
        description,
        imageUrl,
        beforeImageUrl,
        category,
      },
    });

    return res.status(201).json({ success: true, message: 'Portfolio item added.', item });
  } catch (error: any) {
    console.error('addPortfolioItem error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add portfolio item.' });
  }
};

export const uploadKYCDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const worker = await prisma.workerProfile.findUnique({ where: { userId: req.user.userId } });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    const { docType, docNumber, fileUrl } = req.body;

    const doc = await prisma.kYCDocument.create({
      data: {
        workerId: worker.id,
        docType: docType || 'AADHAAR',
        docNumber: docNumber || '',
        fileUrl,
        status: 'PENDING',
      },
    });

    await prisma.workerProfile.update({
      where: { id: worker.id },
      data: { verificationState: 'PENDING' },
    });

    return res.status(201).json({ success: true, message: 'KYC Document submitted for verification.', doc });
  } catch (error: any) {
    console.error('uploadKYCDocument error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload document.' });
  }
};

export const requestPayout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const worker = await prisma.workerProfile.findUnique({ where: { userId: req.user.userId } });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    const { amount } = req.body;
    const reqAmount = Number(amount);

    if (!reqAmount || reqAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payout amount.' });
    }

    if (worker.walletBalance < reqAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
    }

    // Deduct wallet and create payout record
    await prisma.workerProfile.update({
      where: { id: worker.id },
      data: { walletBalance: { decrement: reqAmount } },
    });

    const payout = await prisma.payout.create({
      data: {
        workerId: worker.id,
        amount: reqAmount,
        status: 'PENDING',
      },
    });

    return res.status(201).json({
      success: true,
      message: `Withdrawal request for ₹${reqAmount.toLocaleString()} submitted. Admin approval in progress.`,
      payout,
    });
  } catch (error: any) {
    console.error('requestPayout error:', error);
    return res.status(500).json({ success: false, message: 'Failed to request payout.' });
  }
};
