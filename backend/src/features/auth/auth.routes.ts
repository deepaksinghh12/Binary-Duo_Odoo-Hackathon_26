import { Router, Request, Response, NextFunction } from 'express';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

// Apply strict rate limiting to auth routes to mitigate brute force attacks
router.use(authRateLimiter);

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (marks unverified, sends OTP)
 * @access  Public
 */
router.post(
  '/signup',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.signup(req.body);
      sendSuccess(res, data, 'Registration successful. Verification OTP sent.', 201);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Log in an existing user (if unverified, requires OTP validation)
 * @access  Public
 */
router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.login(req.body);
      if ('otpRequired' in result) {
        sendSuccess(res, result, 'Verification OTP sent. Verification required.', 200);
      } else {
        sendSuccess(res, result, 'Logged in successfully', 200);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send a new OTP verification code
 * @access  Public
 */
router.post(
  '/send-otp',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const data = await authService.sendOtp(email);
      sendSuccess(res, data, 'Verification OTP sent successfully', 200);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and complete login / verification
 * @access  Public
 */
router.post(
  '/verify-otp',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.verifyOtp(req.body);
      sendSuccess(res, data, 'Account verified and logged in successfully', 200);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
