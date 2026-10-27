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

    // Send in-app notification to the worker
    await prisma.notification.create({
      data: {
        userId: worker.userId,
        title: status === 'VERIFIED' ? 'Account Verified! 🛡️' : 'Verification Update',
        message: status === 'VERIFIED'
          ? `Congratulations! Your worker profile has been verified with badge ${badgeLevel}. You can now submit quotes.`
          : `Your KYC verification was not approved. Note: ${adminNote || 'Please update your documents.'}`,
        type: 'ADMIN_ALERT',
        link: '/worker/profile',
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
        raisedBy: { select: { id: true, name: true, role: true } },
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
      orderBy: { updatedAt: 'desc' },
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

// GET /api/admin/users - User Management (Filter by role, search by name/email/phone)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, search, page = '1', limit = '50' } = req.query;

    const whereClause: any = {};

    if (role && role !== 'ALL') {
      whereClause.role = String(role).toUpperCase();
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { city: { contains: q } },
      ];
    }

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          city: true,
          isBlocked: true,
          avatarUrl: true,
          createdAt: true,
          workerProfile: {
            select: {
              id: true,
              verificationState: true,
              badgeLevel: true,
              rating: true,
              jobsCompleted: true,
              yearsExperience: true,
              serviceArea: true,
            },
          },
          _count: {
            select: {
              requirements: true,
              customerOrders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return res.json({
      success: true,
      users,
      totalCount,
      page: Number(page) || 1,
      totalPages: Math.ceil(totalCount / take),
    });
  } catch (error: any) {
    console.error('getUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// PUT /api/admin/users/:id/block - Block or unblock a user
export const toggleBlockUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isBlocked, reason } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Cannot block platform administrator accounts.' });
    }

    const nextBlockedState = typeof isBlocked === 'boolean' ? isBlocked : !user.isBlocked;

    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: nextBlockedState },
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          adminId: req.user.userId,
          action: nextBlockedState ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
          targetId: id,
          details: `User ${user.name} (${user.email}, ${user.role}) was ${nextBlockedState ? 'BLOCKED' : 'UNBLOCKED'}. Reason: ${reason || 'Admin console action.'}`,
        },
      });
    }

    return res.json({
      success: true,
      message: `User ${user.name} has been ${nextBlockedState ? 'blocked' : 'unblocked'}.`,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        isBlocked: updated.isBlocked,
      },
    });
  } catch (error: any) {
    console.error('toggleBlockUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user block status.' });
  }
};

// GET /api/admin/audit-logs - Fetch platform audit trail
export const getAuditLogs = async (_req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        admin: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ success: true, logs });
  } catch (error: any) {
    console.error('getAuditLogs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
};

// GET /api/admin/orders/:orderId/chat - Read-only chat transcript for Admin dispute adjudication
export const getOrderChatTranscript = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        worker: { include: { user: { select: { id: true, name: true, email: true } } } },
        requirement: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Find the Chat between customer and worker for this requirement
    const chat = await prisma.chat.findFirst({
      where: {
        customerId: order.customerId,
        workerId: order.workerId,
        requirementId: order.requirementId,
      },
      include: {
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        customer: order.customer,
        worker: order.worker,
      },
      chat: chat || null,
      messages: chat?.messages || [],
    });
  } catch (error: any) {
    console.error('getOrderChatTranscript error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dispute chat transcript.' });
  }
};


