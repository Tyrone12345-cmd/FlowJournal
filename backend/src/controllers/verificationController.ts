import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateToken } from '../utils/jwt';

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token: verificationToken } = req.params;

    console.log('Verification attempt with token:', verificationToken);

    if (!verificationToken) {
      throw new AppError('Verification token is required', 400);
    }

    // Find user with this token
    const result = await query(
      `SELECT id, email, verification_token_expires, email_verified 
       FROM users 
       WHERE verification_token = $1`,
      [verificationToken]
    );

    if (result.rows.length === 0) {
      console.log('No user found with verification token');
      throw new AppError('Invalid or expired verification token', 400);
    }

    const user = result.rows[0];
    console.log('User found:', user.email);

    // Check if already verified
    if (user.email_verified) {
      console.log('Email already verified for user:', user.email);
      
      // Get full user data and generate token
      const userDataResult = await query(
        'SELECT id, email, first_name, last_name, email_verified, onboarding_completed FROM users WHERE id = $1',
        [user.id]
      );
      
      const userData = userDataResult.rows[0];
      const authToken = generateToken({ userId: userData.id });
      
      return res.json({
        message: 'Email already verified.',
        alreadyVerified: true,
        token: authToken,
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          emailVerified: userData.email_verified,
          onboardingCompleted: userData.onboarding_completed,
        },
      });
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(user.verification_token_expires);
    
    if (now > expiresAt) {
      console.log('Token expired for user:', user.email);
      throw new AppError('Verification token has expired. Please request a new verification email.', 400);
    }

    // Update user - set email_verified to true and clear token
    await query(
      `UPDATE users 
       SET email_verified = true, 
           verification_token = NULL, 
           verification_token_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id]
    );

    console.log('Email verified successfully for user:', user.email);

    // Get full user data and generate token for auto-login
    const userDataResult = await query(
      'SELECT id, email, first_name, last_name, email_verified, onboarding_completed FROM users WHERE id = $1',
      [user.id]
    );
    
    const userData = userDataResult.rows[0];
    const authToken = generateToken({ userId: userData.id });

    res.json({
      message: 'Email verified successfully.',
      verified: true,
      token: authToken,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        emailVerified: userData.email_verified,
        onboardingCompleted: userData.onboarding_completed,
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    next(error);
  }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Find user
    const result = await query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.email_verified) {
      throw new AppError('Email is already verified', 400);
    }

    // Generate new token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await query(
      `UPDATE users 
       SET verification_token = $1, 
           verification_token_expires = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [verificationToken, verificationExpires, user.id]
    );

    // Send verification email
    const { sendVerificationEmail } = require('../utils/email');
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      throw new AppError('Failed to send verification email', 500);
    }

    res.json({
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    next(error);
  }
};
