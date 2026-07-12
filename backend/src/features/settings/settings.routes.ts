import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { settingsService } from './settings.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

// Require authentication for all settings endpoints
router.use(authenticate);

/**
 * @route   GET /api/settings
 * @desc    Get all system settings
 * @access  Private (Authenticated users)
 */
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await settingsService.listSettings();
      sendSuccess(res, data, 'Settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/settings/:key
 * @desc    Update a specific setting value
 * @access  Private (Admin only)
 */
export default router;
