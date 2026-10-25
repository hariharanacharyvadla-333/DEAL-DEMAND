import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Helper Validators
export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
};

export const isValidPassword = (password: string) => {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        workerProfile: {
          include: {
            categories: { include: { category: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Account blocked' });
    }

    // Role check if specified by portal
    if (role) {
      const portalRole = role.toUpperCase();
      if (portalRole === 'WORKER' && user.role === 'CUSTOMER') {
        return res.status(403).json({
          success: false,
          message: 'This account is registered as a customer',
        });
      }
      if (portalRole === 'CUSTOMER' && user.role === 'WORKER') {
        return res.status(403).json({
          success: false,
          message: 'This account is registered as a worker',
        });
      }
      if (portalRole === 'ADMIN' && user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Administrator privileges required.',
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    let loginMessage = 'Logged in successfully';
    if (user.role === 'WORKER' && user.workerProfile?.verificationState === 'PENDING') {
      loginMessage = 'Worker pending verification';
    }

    return res.json({
      success: true,
      message: loginMessage,
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
    const { name, email, phone, password, confirmPassword, city } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanPhone = phone.trim();
    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number.' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain both a letter and a number.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Duplicate email check
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Duplicate phone check
    const existingPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'An account with this phone already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        city: city?.trim() || 'Bengaluru',
        passwordHash,
        role: 'CUSTOMER',
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
        phone: user.phone,
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
      phone,
      password,
      confirmPassword,
      city,
      categorySlugs,
      categorySlug,
      skills,
      yearsExperience,
      serviceArea,
      tagline,
      bio,
      idProofUrl,
      workPhotoUrls,
      bankUpi,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanPhone = phone.trim();
    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number.' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain both a letter and a number.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Duplicate email check
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Duplicate phone check
    const existingPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'An account with this phone already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        city: city?.trim() || 'Bengaluru',
        passwordHash,
        role: 'WORKER',
      },
    });

    // Lookup categories
    const targetSlugs = Array.isArray(categorySlugs) && categorySlugs.length > 0
      ? categorySlugs
      : (categorySlug ? [categorySlug] : []);

    const categories = await prisma.category.findMany({
      where: targetSlugs.length > 0 ? { slug: { in: targetSlugs } } : undefined,
    });

    const workerProfile = await prisma.workerProfile.create({
      data: {
        userId: user.id,
        tagline: tagline?.trim() || `Professional Artisan in ${city || 'India'}`,
        bio: bio?.trim() || 'Experienced craftsman dedicated to precision, transparent quoting, and timely delivery.',
        yearsExperience: Number(yearsExperience) || 1,
        serviceArea: serviceArea?.trim() || city?.trim() || 'Bengaluru',
        skills: Array.isArray(skills) ? skills.join(', ') : (skills?.trim() || 'Specialist'),
        verificationState: 'PENDING',
        badgeLevel: 'BASIC',
        rating: 5.0,
        bankUpiDetails: bankUpi ? JSON.stringify({ upiId: bankUpi.trim() }) : null,
        categories: {
          create: categories.map((c) => ({ categoryId: c.id })),
        },
      },
      include: {
        categories: { include: { category: true } },
      },
    });

    // Save ID Proof if provided
    if (idProofUrl) {
      await prisma.kYCDocument.create({
        data: {
          workerId: workerProfile.id,
          docType: 'AADHAAR',
          fileUrl: idProofUrl,
          status: 'PENDING',
        },
      });
    }

    // Save KYC Documents array if provided
    if (Array.isArray(req.body.kycDocuments)) {
      for (const doc of req.body.kycDocuments) {
        if (doc && (doc.fileUrl || doc.docUrl)) {
          await prisma.kYCDocument.create({
            data: {
              workerId: workerProfile.id,
              docType: doc.docType || 'GOVT_ID',
              docNumber: doc.docNumber || null,
              fileUrl: doc.fileUrl || doc.docUrl,
              status: 'PENDING',
            },
          });
        }
      }
    }

    // Save Portfolio items if provided
    if (Array.isArray(workPhotoUrls)) {
      for (const pUrl of workPhotoUrls) {
        if (pUrl) {
          await prisma.portfolioItem.create({
            data: {
              workerId: workerProfile.id,
              title: 'Work Sample',
              imageUrl: pUrl,
            },
          });
        }
      }
    } else if (typeof workPhotoUrls === 'string' && workPhotoUrls.trim()) {
      await prisma.portfolioItem.create({
        data: {
          workerId: workerProfile.id,
          title: 'Work Sample',
          imageUrl: workPhotoUrls.trim(),
        },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration submitted. Your profile is under admin review.',
      token,
      worker: workerProfile,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        city: user.city,
        phone: user.phone,
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
