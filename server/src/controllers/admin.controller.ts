import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getAdminStats = async (_req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalWorkers = await prisma.workerProfile.count();
    const totalDeals = await prisma.requirement.count();
    const totalOrders = await prisma.order.count();

    const orders = await prisma.order.findMany();
    const gmv = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const platformRevenue = orders.reduce((sum, o) => sum + o.commissionAmount, 0);

    const escrowsHeld = await prisma.escrowTransaction.aggregate({
      where: { status: 'HELD' },
      _sum: { amountHeld: true },
    });

    const pendingKYC = await prisma.workerProfile.count({
      where: { verificationState: 'PENDING' },
    });

    const openDisputes = await prisma.dispute.count({
      where: { status: 'OPEN' },
    });

    // Category breakdown
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { requirements: true, workers: true } },
      },
    });

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalWorkers,
        totalDeals,
        totalOrders,
        gmv,
        platformRevenue,
        escrowHeldTotal: escrowsHeld._sum.amountHeld || 0,
        pendingKYC,
        openDisputes,
      },
      categorySplit: categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        dealsCount: c._count.requirements,
        workersCount: c._count.workers,
      })),
    });
  } catch (error: any) {
    console.error('getAdminStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
};

export const getVerificationQueue = async (_req: AuthRequest, res: Response) => {
  try {
    const workers = await prisma.workerProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, city: true, avatarUrl: true } },
        kycDocuments: true,
        categories: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, queue: workers });
  } catch (error: any) {
    console.error('getVerificationQueue error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch verification queue.' });
  }
};

export const updateWorkerVerification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, badgeLevel, adminNote } = req.body;

    const worker = await prisma.workerProfile.update({
      where: { id },
      data: {
        verificationState: status || 'VERIFIED',
        badgeLevel: badgeLevel || 'VERIFIED',
      },
      include: { user: true },
    });

    // Update KYC documents status
    await prisma.kYCDocument.updateMany({
      where: { workerId: id },
      data: {
        status: status || 'VERIFIED',
        adminNote: adminNote || 'Admin approved document.',
        reviewedAt: new Date(),
      },
    });

    // Audit log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          adminId: req.user.userId,
          action: `KYC_${status || 'VERIFIED'}`,
          targetId: id,
          details: `Worker ${worker.user.name} status updated to ${status} with badge ${badgeLevel}. Note: ${adminNote || 'N/A'}`,
        },
      });
    }

    return res.json({
      success: true,
      message: `Worker verification status updated to ${status}.`,
      worker,
    });
  } catch (error: any) {
    console.error('updateWorkerVerification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update verification.' });
  }
};

export const getEscrowBoard = async (_req: AuthRequest, res: Response) => {
  try {
    const escrows = await prisma.escrowTransaction.findMany({
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, email: true, city: true } },
            worker: { include: { user: { select: { id: true, name: true, email: true, city: true } } } },
            milestones: true,
            delivery: true,
          },
        },
      },
      orderBy: { heldAt: 'desc' },
    });

    const payouts = await prisma.payout.findMany({
      include: {
        worker: { include: { user: { select: { id: true, name: true, phone: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, escrows, payouts });
  } catch (error: any) {
    console.error('getEscrowBoard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch escrow board.' });
  }
};

export const releaseEscrowAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { escrowId } = req.params;

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
      include: { order: { include: { worker: true } } },
    });

    if (!escrow) {
      return res.status(404).json({ success: false, message: 'Escrow transaction not found.' });
    }

    await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: { status: 'RELEASED_TO_WORKER', releasedAt: new Date() },
    });

    // Update order
    await prisma.order.update({
      where: { id: escrow.orderId },
      data: { status: 'COMPLETED' },
    });

    // Credit worker wallet
    const netPay = escrow.order.workerNetPay;
    await prisma.workerProfile.update({
      where: { id: escrow.order.workerId },
      data: {
        walletBalance: { increment: netPay },
        pendingEscrow: { decrement: netPay },
      },
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          adminId: req.user.userId,
          action: 'ADMIN_ESCROW_RELEASE',
          targetId: escrowId,
          details: `Admin released ₹${netPay.toLocaleString()} to worker for order ${escrow.order.orderNumber}`,
        },
      });
    }

    return res.json({
      success: true,
      message: `Escrow released! ₹${netPay.toLocaleString()} credited to worker wallet.`,
    });
  } catch (error: any) {
    console.error('releaseEscrowAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Failed to release escrow.' });
  }
};

export const resolveDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { disputeId } = req.params;
    const { decision, refundAmount, workerAmount, note } = req.body;

    const dispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        decision,
        status: decision === 'REFUND' ? 'RESOLVED_REFUND' : decision === 'RELEASE' ? 'RESOLVED_RELEASE' : 'RESOLVED_SPLIT',
        refundAmount: Number(refundAmount) || 0,
        workerAmount: Number(workerAmount) || 0,
        resolvedAt: new Date(),
      },
      include: { order: { include: { escrow: true, customer: true, worker: { include: { user: true } } } } },
    });

    // If refund
    if (decision === 'REFUND') {
      await prisma.escrowTransaction.update({
        where: { orderId: dispute.orderId },
        data: { status: 'REFUNDED_TO_CUSTOMER' },
      });
    } else if (decision === 'RELEASE') {
      await prisma.escrowTransaction.update({
        where: { orderId: dispute.orderId },
        data: { status: 'RELEASED_TO_WORKER' },
      });
    } else {
      await prisma.escrowTransaction.update({
        where: { orderId: dispute.orderId },
        data: { status: 'SPLIT_RESOLVED' },
      });
    }

    return res.json({
      success: true,
      message: 'Dispute resolved successfully with decision communicated to both parties.',
      dispute,
    });
  } catch (error: any) {
    console.error('resolveDispute error:', error);
    return res.status(500).json({ success: false, message: 'Failed to resolve dispute.' });
  }
};

export const addCategoryField = async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, fieldName, label, fieldType, options, isRequired, placeholder } = req.body;

    const field = await prisma.categoryField.create({
      data: {
        categoryId,
        fieldName,
        label,
        fieldType,
        options: options ? (typeof options === 'object' ? JSON.stringify(options) : options) : null,
        isRequired: Boolean(isRequired),
        placeholder,
      },
    });

    return res.status(201).json({ success: true, message: 'Field added to category!', field });
  } catch (error: any) {
    console.error('addCategoryField error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add field.' });
  }
};

export const getDisputes = async (_req: AuthRequest, res: Response) => {
  try {
    const disputes = await prisma.dispute.findMany({
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, email: true, city: true } },
            worker: { include: { user: { select: { id: true, name: true, email: true, city: true } } } },
            requirement: { select: { id: true, title: true } },
          },
        },
        filedBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, disputes });
  } catch (error: any) {
    console.error('getDisputes error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch disputes.' });
  }
};

export const getDeliveries = async (_req: AuthRequest, res: Response) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, city: true } },
            worker: { include: { user: { select: { id: true, name: true, city: true } } } },
            requirement: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, deliveries });
  } catch (error: any) {
    console.error('getDeliveries error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch deliveries.' });
  }
};

export const getFlaggedItems = async (_req: AuthRequest, res: Response) => {
  try {
    const disputes = await prisma.dispute.findMany({
      where: { status: 'OPEN' },
      include: {
        order: {
          include: {
            customer: true,
            worker: { include: { user: true } },
            requirement: true,
          },
        },
      },
      take: 10,
    });

    const flagged = disputes.map((d) => ({
      id: d.id,
      target: d.order ? `ORDER #${d.order.orderNumber}: ${d.order.requirement?.title || 'Contract'}` : 'Escrow Dispute',
      type: 'Open Escrow Dispute',
      reason: d.reason,
      severity: 'HIGH',
      date: d.createdAt.toISOString().split('T')[0],
      actionNeeded: 'Review Dispute Evidence',
    }));

    return res.json({ success: true, flagged });
  } catch (error: any) {
    console.error('getFlaggedItems error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch flagged items.' });
  }
};

