import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIService } from '../services/ai.service';

const prisma = new PrismaClient();

export const getDeals = async (req: AuthRequest, res: Response) => {
  try {
    const { category, city, urgency, minBudget, maxBudget, search, status } = req.query;

    const where: any = {};

    if (category) {
      where.category = { slug: String(category) };
    }
    if (city) {
      where.city = { contains: String(city) };
    }
    if (urgency) {
      where.urgency = String(urgency).toUpperCase();
    }
    if (status) {
      where.status = String(status);
    }
    if (minBudget) {
      where.minBudget = { gte: Number(minBudget) };
    }
    if (maxBudget) {
      where.maxBudget = { lte: Number(maxBudget) };
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
        { city: { contains: String(search) } },
      ];
    }

    const deals = await prisma.requirement.findMany({
      where,
      include: {
        category: true,
        customer: { select: { id: true, name: true, city: true, avatarUrl: true } },
        images: true,
        _count: { select: { quotations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      deals: deals.map((d) => ({
        ...d,
        quotationsCount: d._count.quotations,
      })),
    });
  } catch (error: any) {
    console.error('getDeals error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch deals.' });
  }
};

export const getMyDeals = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const deals = await prisma.requirement.findMany({
      where: { customerId: req.user.userId },
      include: {
        category: true,
        images: true,
        quotations: {
          include: {
            worker: {
              include: { user: { select: { id: true, name: true, avatarUrl: true, city: true } } },
            },
            items: true,
          },
        },
        orders: {
          include: {
            milestones: true,
            escrow: true,
            delivery: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, deals });
  } catch (error: any) {
    console.error('getMyDeals error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch your deals.' });
  }
};

export const getDealById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deal = await prisma.requirement.findUnique({
      where: { id },
      include: {
        category: { include: { fields: true } },
        customer: { select: { id: true, name: true, email: true, phone: true, city: true, avatarUrl: true } },
        images: true,
        quotations: {
          include: {
            worker: {
              include: {
                user: { select: { id: true, name: true, city: true, avatarUrl: true } },
                categories: { include: { category: true } },
              },
            },
            items: true,
          },
          orderBy: { totalPrice: 'asc' },
        },
        orders: {
          include: {
            milestones: true,
            escrow: true,
            delivery: true,
          },
        },
      },
    });

    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }

    // Mask customer phone if viewer is worker and quotation not yet accepted
    let customerData = deal.customer;
    const isOwner = req.user?.userId === deal.customerId;
    const isAdmin = req.user?.role === 'ADMIN';
    const hasAcceptedOrder = deal.orders && deal.orders.length > 0;

    if (!isOwner && !isAdmin && !hasAcceptedOrder && customerData) {
      customerData = {
        ...customerData,
        phone: 'Protected (Reveals on acceptance)',
      };
    }

    return res.json({
      success: true,
      deal: {
        ...deal,
        customer: customerData,
      },
    });
  } catch (error: any) {
    console.error('getDealById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch deal details.' });
  }
};

export const createDeal = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      categoryId,
      title,
      description,
      dynamicValues,
      minBudget,
      maxBudget,
      isNegotiable,
      city,
      address,
      lat,
      lng,
      deadline,
      urgency,
      workLocationType,
      materialsSupplied,
      installationReq,
      siteVisitReq,
      imageUrls,
      aiSpecs,
    } = req.body;

    if (!categoryId || !title || !description || !minBudget || !maxBudget) {
      return res.status(400).json({ success: false, message: 'Missing required deal parameters.' });
    }

    // Check fraud risk
    const fraudCheck = AIService.detectFraudRisk(
      `${title} ${description}`,
      Number(maxBudget)
    );

    const deal = await prisma.requirement.create({
      data: {
        customerId: req.user.userId,
        categoryId,
        title,
        description,
        dynamicValues: typeof dynamicValues === 'object' ? JSON.stringify(dynamicValues) : (dynamicValues || '{}'),
        minBudget: Number(minBudget),
        maxBudget: Number(maxBudget),
        isNegotiable: Boolean(isNegotiable),
        city: city || 'Bengaluru',
        address: address || city || 'Bengaluru, India',
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        deadline: deadline ? new Date(deadline) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        urgency: urgency || 'NORMAL',
        workLocationType: workLocationType || 'ON_SITE',
        materialsSupplied: Boolean(materialsSupplied),
        installationReq: installationReq !== undefined ? Boolean(installationReq) : true,
        siteVisitReq: Boolean(siteVisitReq),
        aiSpecs: aiSpecs ? (typeof aiSpecs === 'object' ? JSON.stringify(aiSpecs) : aiSpecs) : null,
        fraudRiskScore: fraudCheck.riskScore,
        status: 'OPEN',
        images: {
          create: Array.isArray(imageUrls) && imageUrls.length > 0
            ? imageUrls.map((url: string) => ({ fileUrl: url, fileType: 'IMAGE' }))
            : [
                {
                  fileUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
                  fileType: 'IMAGE',
                },
              ],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Deal posted successfully!',
      deal,
    });
  } catch (error: any) {
    console.error('createDeal error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create deal.' });
  }
};
