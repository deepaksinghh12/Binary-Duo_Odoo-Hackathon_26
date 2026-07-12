import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

/**
 * @route   GET /api/dashboard/summary
 * @desc    Fetch consolidates ESG and Department metrics
 * @access  Protected (Requires active logged in session)
 */
router.get(
  '/summary',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const data = await dashboardService.getSummary(userId);
      sendSuccess(res, data, 'Dashboard metrics fetched successfully', 200);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
