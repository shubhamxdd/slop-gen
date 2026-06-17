import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema/users';
import { eq, or } from 'drizzle-orm';
import { signToken } from '../utils/jwt';
import { sendOtpEmail } from '../utils/email';
import { OtpService } from '../services/otp.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
});

const loginSchema = z.object({
  identifier: z.string(), // email or username
  password: z.string(),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6),
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = registerSchema.parse(req.body);
    
    // TODO: Check is user provided required fields or not 
    // TODO: Errors are not being sent properly to client

    // Check if user exists
    const existing = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.username, username)),
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Email or Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const [newUser] = await db.insert(users).values({
      email,
      username,
      passwordHash,
    }).returning();

    // Generate OTP
    const otp = await OtpService.generateAndStore(newUser.id);
    try {
      await sendOtpEmail(email, otp);
      res.status(201).json({ 
        success: true, 
        message: 'User registered. Please verify your email.',
        userId: newUser.id 
      });
    } catch (emailError) {
      console.error('Failed to send registration OTP email:', emailError);
      res.status(201).json({ 
        success: true, 
        message: 'User registered, but we could not send the verification email. Please try resending it.',
        userId: newUser.id 
      });
    }
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = loginSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: or(eq(users.email, identifier), eq(users.username, identifier)),
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, error: 'Please verify your email first', isVerified: false });
    }

    const token = signToken({ userId: user.id });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        plan: user.plan,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { userId, otp } = z.object({ 
      userId: z.string().uuid(), 
      otp: z.string().length(6) 
    }).parse(req.body);

    const isValid = await OtpService.verify(userId, otp);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    await db.update(users).set({ isVerified: true }).where(eq(users.id, userId));

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res, next) => {
  try {
    const { userId } = z.object({ userId: z.string().uuid() }).parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'Email already verified' });
    }

    const allowed = await OtpService.consumeResendSlot(userId);
    if (!allowed) {
      return res.status(429).json({ success: false, error: 'Too many attempts. Please try again in an hour.' });
    }

    const otp = await OtpService.generateAndStore(userId);
    
    try {
      await sendOtpEmail(user.email, otp);
      res.json({ success: true, message: 'New verification code sent' });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      res.status(500).json({ success: false, error: 'Failed to send verification email. Please try again.' });
    }
  } catch (error) {
    next(error);
  }
});

// Me
router.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.userId),
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        plan: user.plan,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
