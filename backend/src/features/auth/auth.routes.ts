import { Router, Request, Response, NextFunction } from 'express';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

// Apply strict rate limiting to auth routes to mitigate brute force attacks
router.use(authRateLimiter);

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (caches data, generates and sends OTP)
 * @access  Public
 */
router.post(
  '/signup',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.signup(req.body);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Log in an existing user
 * @access  Public
 */
router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.login(req.body);
      sendSuccess(res, data, 'Logged in successfully', 200);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send a new OTP verification code for pending registration
 * @access  Public
 */
router.post(
  '/send-otp',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await authService.sendOtp(email);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP code, save user to database, and return JWT
 * @access  Public
 */
router.post(
  '/verify-otp',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.verifyOtp(req.body);
      sendSuccess(res, data, 'Account verified and created successfully', 200);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rotate session: refresh access and refresh token pair
 * @access  Public
 */
router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.refreshSession(req.body);
      sendSuccess(res, data, 'Session refreshed successfully', 200);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Invalidate refresh token session
 * @access  Public
 */
router.post(
  '/logout',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      sendSuccess(res, null, 'Logged out successfully', 200);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
