import { Router } from 'express';
import passport from 'passport';
import { register, login, getMe, googleCallback, deleteAccount, completeOnboarding } from '../controllers/authController';
import { verifyEmail, resendVerification } from '../controllers/verificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.delete('/delete-account', authenticate, deleteAccount);
router.post('/complete-onboarding', authenticate, completeOnboarding);

// Email verification routes
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/register' }),
  googleCallback
);

export default router;
