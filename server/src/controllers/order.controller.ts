import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        requirement: {
          include: {
            category: true,
            images: true,
          },
        },
        quotation: {
          include: {
            items: true,
          },
        },
        customer: { select: { id: true, name: true, email: true, phone: true, city: true, avatarUrl: true } },
        worker: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, city: true, avatarUrl: true } },
          },
        },
        milestones: {
          orderBy: { sortOrder: 'asc' },
        },
        escrow: true,
        payments: true,
        delivery: true,
        review: true,
        disputes: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({ success: true, order });
  } catch (error: any) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

export const updateMilestoneProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, milestoneId } = req.params;
    const { photoUrl, status } = req.body;

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        photoUrl: photoUrl || undefined,
        status: status || 'WORKER_COMPLETED',
        completedAt: new Date(),
      },
      include: { order: { include: { customer: true, worker: { include: { user: true } } } } },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: milestone.order.customerId,
        title: 'Milestone Completed for Review',
        message: `${milestone.order.worker.user.name} submitted completion proof for "${milestone.title}". Please inspect and approve.`,
        type: 'DEAL_UPDATE',
        link: `/customer/orders/${orderId}`,
      },
    });

    return res.json({
      success: true,
      message: 'Milestone progress submitted.',
      milestone,
    });
  } catch (error: any) {
    console.error('updateMilestoneProgress error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update milestone.' });
  }
};

export const approveMilestone = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, milestoneId } = req.params;

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        order: {
          include: {
            worker: true,
            milestones: true,
          },
        },
      },
    });

    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found.' });
    }

    // Customer check
    if (milestone.order.customerId !== req.user?.userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to approve milestone.' });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'CUSTOMER_APPROVED',
      },
    });

    // Release proportionate milestone pay to worker wallet
    const milestoneAmount = milestone.amount;
    const netRelease = Math.round(milestoneAmount * 0.95); // deducting 5% commission

    await prisma.workerProfile.update({
      where: { id: milestone.order.workerId },
      data: {
        walletBalance: { increment: netRelease },
        pendingEscrow: { decrement: netRelease },
      },
    });

    // Check if all milestones are completed
    const allApproved = milestone.order.milestones.every(
      (m) => m.id === milestoneId || m.status === 'CUSTOMER_APPROVED' || m.status === 'PAYMENT_RELEASED'
    );

    if (allApproved) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' },
      });
      await prisma.escrowTransaction.update({
        where: { orderId },
        data: { status: 'RELEASED_TO_WORKER', releasedAt: new Date() },
      });
    }

    return res.json({
      success: true,
      message: `Milestone approved and ₹${netRelease.toLocaleString()} released to worker!`,
      milestone: updatedMilestone,
    });
  } catch (error: any) {
    console.error('approveMilestone error:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve milestone.' });
  }
};

export const updateDeliveryProof = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { deliveryProof, status } = req.body;

    const delivery = await prisma.delivery.upsert({
      where: { orderId },
      create: {
        orderId,
        deliveryProof: deliveryProof || null,
        status: status || 'DELIVERED',
        deliveredAt: new Date(),
      },
      update: {
        deliveryProof: deliveryProof || undefined,
        status: status || 'DELIVERED',
        deliveredAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: status || 'DELIVERED' },
    });

    return res.json({
      success: true,
      message: 'Delivery status updated.',
      delivery,
    });
  } catch (error: any) {
    console.error('updateDeliveryProof error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update delivery.' });
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { orderId, ratingQuality, ratingComm, ratingTime, ratingValue, comment, photoUrl } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const q = Number(ratingQuality) || 5;
    const c = Number(ratingComm) || 5;
    const t = Number(ratingTime) || 5;
    const v = Number(ratingValue) || 5;
    const overall = Number(((q + c + t + v) / 4).toFixed(1));

    const review = await prisma.review.create({
      data: {
        orderId,
        customerId: req.user.userId,
        workerId: order.workerId,
        ratingQuality: q,
        ratingComm: c,
        ratingTime: t,
        ratingValue: v,
        overallRating: overall,
        comment: comment || 'Work completed professionally.',
        photoUrl: photoUrl || null,
        editableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days window
      },
    });

    // Recompute worker average rating
    const workerReviews = await prisma.review.findMany({ where: { workerId: order.workerId } });
    const avgRating = Number(
      (workerReviews.reduce((sum, r) => sum + r.overallRating, 0) / workerReviews.length).toFixed(1)
    );

    await prisma.workerProfile.update({
      where: { id: order.workerId },
      data: {
        rating: avgRating,
        totalReviews: workerReviews.length,
        jobsCompleted: { increment: 1 },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Review published successfully!',
      review,
    });
  } catch (error: any) {
    console.error('createReview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

export const fileDispute = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { orderId, reason, evidenceUrl } = req.body;

    const dispute = await prisma.dispute.create({
      data: {
        orderId,
        raisedById: req.user.userId,
        reason,
        evidenceUrl: evidenceUrl || null,
        status: 'OPEN',
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DISPUTED' },
    });

    return res.status(201).json({
      success: true,
      message: 'Dispute submitted. Admin escrow mediator notified.',
      dispute,
    });
  } catch (error: any) {
    console.error('fileDispute error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit dispute.' });
  }
};
