import { Router, Request, Response, NextFunction } from 'express';
import { ChallengesService } from './challenges.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import {
  createChallengeSchema,
  updateChallengeSchema,
  updateChallengeStatusSchema,
  challengeFiltersSchema,
} from './challenges.validation';
import type { ChallengeFilters } from './challenges.types';

const router = Router();
const challengesService = new ChallengesService();

// Get all challenges (with filtering, pagination)
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = challengeFiltersSchema.parse(req.query) as ChallengeFilters;
    const result = await challengesService.getAllChallenges(filters);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: result.total,
        totalPages: Math.ceil(result.total / (filters.limit || 10)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get challenge by ID
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challenge = await challengesService.getChallengeById(String(req.params.id));
    res.status(200).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    next(error);
  }
});

// Create challenge (admin/manager only)
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createChallengeSchema.parse(req.body);
      const challenge = await challengesService.createChallenge(validated);

      res.status(201).json({
        success: true,
        data: challenge,
        message: 'Challenge created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update challenge (admin/manager only)
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = updateChallengeSchema.parse(req.body);
      const challenge = await challengesService.updateChallenge(String(req.params.id), validated);

      res.status(200).json({
        success: true,
        data: challenge,
        message: 'Challenge updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update challenge status (admin/manager only) — enforces state machine
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'manager'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = updateChallengeStatusSchema.parse(req.body);
      const challenge = await challengesService.updateChallengeStatus(String(req.params.id), status);

      res.status(200).json({
        success: true,
        data: challenge,
        message: 'Challenge status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete challenge (admin/manager only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await challengesService.deleteChallenge(String(req.params.id));

      res.status(200).json({
        success: true,
        message: 'Challenge deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
