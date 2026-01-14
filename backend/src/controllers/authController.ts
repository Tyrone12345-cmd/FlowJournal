import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../config/database';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { generateVerificationToken, sendVerificationEmail } from '../utils/email';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.nativeEnum(UserRole).optional(),
  teamId: z.string().uuid().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, role, teamId } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const result = await query(
      `INSERT INTO users (email, password, first_name, last_name, role, team_id, verification_token, verification_token_expires, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
       RETURNING id, email, first_name, last_name, role, team_id, created_at`,
      [email, hashedPassword, firstName, lastName, role || UserRole.TRADER, teamId || null, verificationToken, verificationExpires]
    );

    const user = result.rows[0];

    // Send verification email
    try {
      await sendVerificationEmail(email, firstName, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue registration even if email fails
    }

    // Don't generate JWT token yet - user needs to verify email first
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        teamId: user.team_id,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    
    if (!user) {
      return res.redirect('http://localhost:5173/register?error=google_auth_failed');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Check if onboarding is completed
    if (!user.onboarding_completed) {
      // New Google user - redirect to onboarding with token and google flag
      return res.redirect(`http://localhost:5173/onboarding?token=${token}&google=true`);
    }

    // Existing user - redirect to callback (then dashboard)
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const result = await query(
      'SELECT id, email, password, first_name, last_name, role, team_id, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if email is verified
    if (!user.email_verified) {
      throw new AppError('Please verify your email before logging in', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        teamId: user.team_id,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    const result = await query(
      'SELECT id, email, first_name, last_name, role, team_id, created_at, onboarding_completed FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      teamId: user.team_id,
      createdAt: user.created_at,
      onboardingCompleted: user.onboarding_completed,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    // Lösche den User
    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
      message: 'Account successfully deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const completeOnboarding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { password, firstName, lastName, onboardingData } = req.body;

    // Validate password
    if (!password || password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with password and onboarding completion
    const result = await query(
      `UPDATE users 
       SET password = $1, 
           first_name = COALESCE($2, first_name), 
           last_name = COALESCE($3, last_name),
           onboarding_completed = true,
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, first_name, last_name, role, team_id, created_at`,
      [hashedPassword, firstName, lastName, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    // TODO: Save onboarding data to user_settings or separate table
    // For now we just acknowledge it was sent

    res.json({
      message: 'Onboarding completed successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        teamId: user.team_id,
      },
    });
  } catch (error) {
    next(error);
  }
};
