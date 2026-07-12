import { Router, Request, Response, NextFunction } from 'express';
import { ChallengeParticipationService } from './challengeParticipation.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import {
  createParticipationSchema,
  updateParticipationSchema,
  participationFiltersSchema,
} from './challengeParticipation.validation';
import type { ParticipationFilters } from './challengeParticipation.types';

const router = Router();
const participationService = new ChallengeParticipationService();

// Get all participation records (with filtering) — manager/admin view
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = participationFiltersSchema.parse(req.query) as ParticipationFilters;
    const result = await participationService.getAllParticipation(filters);

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

// Get participation by ID
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const participation = await participationService.getParticipationById(String(req.params.id));
    res.status(200).json({
      success: true,
      data: participation,
    });
  } catch (error) {
    next(error);
  }
});

// Join a challenge (employee creates participation)
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createParticipationSchema.parse(req.body);
    const employeeId = req.user!.userId;

    const participation = await participationService.joinChallenge(employeeId, validated);

    res.status(201).json({
      success: true,
      data: participation,
      message: 'Successfully joined the challenge',
    });
  } catch (error) {
    next(error);
  }
});

// Update participation (employee updates their own)
router.patch('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = updateParticipationSchema.parse(req.body);
    const employeeId = req.user!.userId;

    const participation = await participationService.updateParticipation(
      String(req.params.id),
      employeeId,
      validated
    );

    res.status(200).json({
      success: true,
      data: participation,
      message: 'Participation updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Approve participation (manager/admin only)
router.post(
  '/:id/approve',
  authenticate,
  authorize('admin', 'manager'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const approverId = req.user!.userId;
      const participation = await participationService.approveParticipation(String(req.params.id), approverId);

      res.status(200).json({
        success: true,
        data: participation,
        message: 'Participation approved successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Reject participation (manager/admin only)
router.post(
  '/:id/reject',
  authenticate,
  authorize('admin', 'manager'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const approverId = req.user!.userId;
      const participation = await participationService.rejectParticipation(String(req.params.id), approverId);

      res.status(200).json({
        success: true,
        data: participation,
        message: 'Participation rejected',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
