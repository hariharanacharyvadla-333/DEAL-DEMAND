import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        workerProfile: {
          include: {
            categories: { include: { category: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }

    // Role check if specified
    if (role && user.role !== role.toUpperCase()) {
      const roleStr = user.role.toLowerCase();
      const article = roleStr === 'admin' ? 'an' : 'a';
      return res.status(403).json({
        success: false,
        message: `This account is registered as ${article} ${roleStr}. Please log in through the correct portal.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        city: user.city,
        phone: user.phone,
        workerProfile: user.workerProfile,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, city, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Optional simulated OTP validation
    if (otp && otp !== '1234' && otp !== '123456') {
      return res.status(400).json({ success: false, message: 'Invalid OTP. For demo use 1234.' });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email or phone already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        city: city || 'Bengaluru',
        passwordHash,
        role: 'CUSTOMER',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.status(201).json({
      success: true,
      message: 'Customer account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        city: user.city,
      },
    });
  } catch (error: any) {
    console.error('Customer registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const registerWorker = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      city,
      categorySlugs,
      skills,
      yearsExperience,
      serviceArea,
      tagline,
      bio,
      bankUpi,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        city: city || 'Bengaluru',
        passwordHash,
        role: 'WORKER',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      },
    });

    // Lookup categories
    const categories = await prisma.category.findMany({
      where: categorySlugs && categorySlugs.length > 0 ? { slug: { in: categorySlugs } } : undefined,
    });

    const workerProfile = await prisma.workerProfile.create({
      data: {
        userId: user.id,
        tagline: tagline || `Skilled Professional in ${city}`,
        bio: bio || 'Dedicated artisan ensuring customer satisfaction and quality finishing.',
        yearsExperience: Number(yearsExperience) || 2,
        serviceArea: serviceArea || city || 'Bengaluru',
        skills: Array.isArray(skills) ? skills.join(', ') : (skills || 'General Craftsmanship'),
        verificationState: 'PENDING',
        badgeLevel: 'BASIC',
        rating: 5.0,
        bankUpiDetails: bankUpi ? JSON.stringify({ upiId: bankUpi }) : null,
        categories: {
          create: categories.map((c) => ({ categoryId: c.id })),
        },
      },
      include: {
        categories: { include: { category: true } },
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.status(201).json({
      success: true,
      message: 'Worker registered successfully! Account is pending verification.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        city: user.city,
        workerProfile,
      },
    });
  } catch (error: any) {
    console.error('Worker registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        workerProfile: {
          include: {
            categories: { include: { category: true } },
            portfolioItems: true,
            kycDocuments: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        city: user.city,
        avatarUrl: user.avatarUrl,
        workerProfile: user.workerProfile,
      },
    });
  } catch (error: any) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};
