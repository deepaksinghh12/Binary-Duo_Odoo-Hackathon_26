import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';
import { UserRole } from '../../shared/types';

const router = Router();

// Apply JWT authentication middleware globally across dashboard paths
router.use(authenticate);

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get consolidated ESG ratings and score weights
 * @access  Private (Authenticated users)
 */
router.get(
  '/summary',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      
      // Parse weights from query params if passed
      const customWeights = {
        environmental: req.query.environmental ? Number(req.query.environmental) : undefined,
        social: req.query.social ? Number(req.query.social) : undefined,
        governance: req.query.governance ? Number(req.query.governance) : undefined,
      };

      // Filter out undefined keys
      const weights = Object.fromEntries(
        Object.entries(customWeights).filter(([_, v]) => v !== undefined)
      );

      const data = await dashboardService.getSummary(
        userId,
        Object.keys(weights).length > 0 ? weights : undefined
      );

      sendSuccess(res, data, 'ESG Summary scores fetched successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/dashboard/emission-trend
 * @desc    Get last 12 months carbon emission metrics
 * @access  Private (Authenticated users)
 */
router.get(
  '/emission-trend',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const data = await dashboardService.getEmissionTrend(userId);
      sendSuccess(res, data, 'Emission trends fetched successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/dashboard/department-ranking
 * @desc    Get sorted department ESG scores
 * @access  Private (Authenticated users)
 */
router.get(
  '/department-ranking',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const data = await dashboardService.getDepartmentRanking(userId);
      sendSuccess(res, data, 'Department ESG rankings fetched successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/dashboard/recent-activities
 * @desc    Get maximum 10 latest organizational events
 * @access  Private (Authenticated users)
 */
router.get(
  '/recent-activities',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const data = await dashboardService.getRecentActivities(userId);
      sendSuccess(res, data, 'Recent activities fetched successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/dashboard/quick-actions
 * @desc    Get available navigation links based on user role
 * @access  Private (Authenticated users)
 */
router.get(
  '/quick-actions',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = req.user!.role as UserRole;
      const data = await dashboardService.getQuickActions(role);
      sendSuccess(res, data, 'Quick actions fetched successfully');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
