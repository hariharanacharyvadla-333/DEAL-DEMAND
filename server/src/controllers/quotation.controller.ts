import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const submitQuotation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Worker profile check
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!workerProfile) {
      return res.status(403).json({ success: false, message: 'Only registered workers can submit quotations.' });
    }

    const {
      requirementId,
      totalPrice,
      timelineDays,
      warrantyMonths,
      deliveryTerms,
      notes,
      items, // array of { title, category, amount }
    } = req.body;

    if (!requirementId || !totalPrice || !timelineDays) {
      return res.status(400).json({ success: false, message: 'Missing required quotation fields.' });
    }

    // Check if worker already submitted for this deal
    const existing = await prisma.quotation.findFirst({
      where: { requirementId, workerId: workerProfile.id },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a quotation for this requirement.' });
    }

    const quotation = await prisma.quotation.create({
      data: {
        requirementId,
        workerId: workerProfile.id,
        totalPrice: Number(totalPrice),
        timelineDays: Number(timelineDays),
        warrantyMonths: Number(warrantyMonths) || 0,
        deliveryTerms: deliveryTerms || 'Execution as per agreement',
        notes: notes || '',
        status: 'PENDING',
        aiValueScore: 88.0,
        items: {
          create: Array.isArray(items) && items.length > 0
            ? items.map((i: any) => ({
                title: i.title || 'Item',
                category: i.category || 'MATERIAL',
                amount: Number(i.amount) || 0,
              }))
            : [
                { title: 'Materials & Procurement', category: 'MATERIAL', amount: Math.round(Number(totalPrice) * 0.6) },
                { title: 'Skilled Labour & Workmanship', category: 'LABOUR', amount: Math.round(Number(totalPrice) * 0.3) },
                { title: 'Logistics & Taxes', category: 'TRANSPORT', amount: Math.round(Number(totalPrice) * 0.1) },
              ],
        },
      },
      include: {
        items: true,
        worker: { include: { user: true } },
      },
    });

    // Update requirement status to QUOTATIONS_RECEIVED if still OPEN
    await prisma.requirement.update({
      where: { id: requirementId },
      data: { status: 'QUOTATIONS_RECEIVED' },
    });

    // Notify customer
    const requirement = await prisma.requirement.findUnique({ where: { id: requirementId } });
    if (requirement) {
      // Ensure chat exists between customer and worker
      const existingChat = await prisma.chat.findFirst({
        where: {
          customerId: requirement.customerId,
          workerId: workerProfile.id,
          requirementId,
        },
      });
      if (!existingChat) {
        await prisma.chat.create({
          data: {
            customerId: requirement.customerId,
            workerId: workerProfile.id,
            requirementId,
          },
        });
      }

      await prisma.notification.create({
        data: {
          userId: requirement.customerId,
          title: 'New Quotation Received',
          message: `${req.user.name} submitted a quotation of ₹${Number(totalPrice).toLocaleString()} for "${requirement.title}"`,
          type: 'NEW_QUOTATION',
          link: `/customer/deals/${requirementId}/compare`,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Quotation submitted successfully!',
      quotation,
    });
  } catch (error: any) {
    console.error('submitQuotation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit quotation.' });
  }
};

export const acceptQuotation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { deliveryAddress } = req.body;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        requirement: { include: { category: true } },
        worker: { include: { user: true } },
      },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    // Verify current user is the customer of this requirement
    if (quotation.requirement.customerId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You are not authorized to accept this quotation.' });
    }

    // Update quotation status
    await prisma.quotation.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    // Mark other quotations for this requirement as REJECTED
    await prisma.quotation.updateMany({
      where: {
        requirementId: quotation.requirementId,
        id: { not: id },
      },
      data: { status: 'REJECTED' },
    });

    // Calculate commission
    const totalAmount = quotation.totalPrice;
    const commissionRate = quotation.requirement.category.commissionPct || 5.0;
    const commissionAmount = (totalAmount * commissionRate) / 100;
    const workerNetPay = totalAmount - commissionAmount;

    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Order with default 3-stage milestones and escrow hold
    const order = await prisma.order.create({
      data: {
        orderNumber,
        requirementId: quotation.requirementId,
        quotationId: quotation.id,
        customerId: quotation.requirement.customerId,
        workerId: quotation.workerId,
        totalAmount,
        commissionRate,
        commissionAmount,
        workerNetPay,
        status: 'ACCEPTED',
        deliveryAddress: deliveryAddress || quotation.requirement.address,
        milestones: {
          create: [
            {
              title: 'Milestone 1: Project Kickoff & Material Procurement',
              description: 'Initial site visit, dimension verification, and raw material procurement.',
              amount: Math.round(totalAmount * 0.4),
              sortOrder: 1,
              status: 'IN_PROGRESS',
            },
            {
              title: 'Milestone 2: Fabrication / Work In Progress',
              description: 'Primary craftsmanship execution and structural completion.',
              amount: Math.round(totalAmount * 0.4),
              sortOrder: 2,
              status: 'PENDING',
            },
            {
              title: 'Milestone 3: Final Delivery, Installation & Sign-off',
              description: 'Final touches, customer inspection, and on-site completion.',
              amount: Math.round(totalAmount * 0.2),
              sortOrder: 3,
              status: 'PENDING',
            },
          ],
        },
        escrow: {
          create: {
            amountHeld: totalAmount,
            status: 'HELD',
          },
        },
        delivery: {
          create: {
            status: 'IN_TRANSIT',
            trackingId: `DEL-${Math.floor(100000 + Math.random() * 900000)}`,
          },
        },
        payments: {
          create: [
            {
              paymentType: 'DEPOSIT',
              amount: totalAmount,
              status: 'SUCCESS',
              method: 'UPI',
              invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            },
          ],
        },
      },
      include: {
        milestones: true,
        escrow: true,
      },
    });

    // Update Requirement status
    await prisma.requirement.update({
      where: { id: quotation.requirementId },
      data: { status: 'WORKER_SELECTED' },
    });

    // Update worker pending escrow
    await prisma.workerProfile.update({
      where: { id: quotation.workerId },
      data: {
        pendingEscrow: { increment: workerNetPay },
      },
    });

    // Notify worker
    await prisma.notification.create({
      data: {
        userId: quotation.worker.userId,
        title: 'Quotation Accepted! 🎉',
        message: `Your quotation for "${quotation.requirement.title}" was accepted! Order ${orderNumber} created. Funds held in platform escrow.`,
        type: 'DEAL_UPDATE',
        link: `/worker/projects/${order.id}`,
      },
    });

    // Ensure Chat exists and post post-acceptance system message
    try {
      let chat = await prisma.chat.findFirst({
        where: {
          customerId: quotation.requirement.customerId,
          workerId: quotation.workerId,
          requirementId: quotation.requirementId,
        },
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            customerId: quotation.requirement.customerId,
            workerId: quotation.workerId,
            requirementId: quotation.requirementId,
          },
        });
      }

      const systemMsg = await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: quotation.requirement.customerId,
          text: `Quotation of ₹${totalAmount.toLocaleString()} accepted. Work can begin.`,
          isMasked: false,
        },
        include: {
          sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
        },
      });

      await prisma.chat.update({
        where: { id: chat.id },
        data: { updatedAt: new Date() },
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`chat:${chat.id}`).emit('new_message', systemMsg);
        io.to(`conversation:${chat.id}`).emit('new_message', systemMsg);
        io.to(`user:${quotation.worker.userId}`).emit('chat_notification', {
          chatId: chat.id,
          senderName: 'Platform Escrow',
          message: systemMsg,
        });
      }
    } catch (chatErr) {
      console.error('Error posting acceptance system chat message:', chatErr);
    }

    return res.json({
      success: true,
      message: 'Quotation accepted and Order successfully created with Escrow protection!',
      order,
    });
  } catch (error: any) {
    console.error('acceptQuotation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to accept quotation.' });
  }
};

export const negotiateQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { counterPrice, note } = req.body;

    if (!counterPrice) {
      return res.status(400).json({ success: false, message: 'Counter price is required.' });
    }

    const quotation = await prisma.quotation.update({
      where: { id },
      data: {
        status: 'NEGOTIATING',
        counterPrice: Number(counterPrice),
        notes: note ? `Counter Offer: ₹${counterPrice} (${note})` : undefined,
      },
      include: { worker: { include: { user: true } }, requirement: true },
    });

    // Notify worker
    await prisma.notification.create({
      data: {
        userId: quotation.worker.userId,
        title: 'Quotation Counter Offer Received',
        message: `Customer proposed a counter price of ₹${Number(counterPrice).toLocaleString()} for "${quotation.requirement.title}".`,
        type: 'NEW_QUOTATION',
        link: '/worker/quotes',
      },
    });

    return res.json({
      success: true,
      message: 'Counter offer sent to worker.',
      quotation,
    });
  } catch (error: any) {
    console.error('negotiateQuotation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to negotiate quotation.' });
  }
};

export const getWorkerQuotations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!workerProfile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    const quotations = await prisma.quotation.findMany({
      where: { workerId: workerProfile.id },
      include: {
        requirement: {
          include: {
            category: true,
            customer: { select: { id: true, name: true, city: true, avatarUrl: true } },
          },
        },
        items: true,
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, quotations });
  } catch (error: any) {
    console.error('getWorkerQuotations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quotations.' });
  }
};
