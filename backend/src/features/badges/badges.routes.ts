import { Router, Request, Response, NextFunction } from 'express';
import { badgesService } from './badges.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import type { AuthenticatedRequest } from '../../shared/types';

const router = Router();

// All badge routes require authentication
router.use(authenticate);

/**
 * GET /api/badges
 * Admin/manager: plain list.
 * Employee: gallery view with locked/unlocked state for requesting user.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    if (authReq.user.role === 'employee') {
      // Employee sees gallery with their unlock state
      const result = await badgesService.listBadgesForEmployee(authReq.user.userId, { page, limit });
      return res.json({ success: true, ...result });
    }

    // Admin/manager sees plain CRUD list
    const result = await badgesService.listBadges({
      page,
      limit,
      search: req.query.search as string,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/badges/my
 * Returns only the badges the authenticated employee has unlocked.
 */
router.get('/my', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const badges = await badgesService.getMyBadges(authReq.user.userId);
    res.json({ success: true, data: badges });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/badges/:id
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const badge = await badgesService.getBadge(req.params.id as string);
    res.json({ success: true, data: badge });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/badges  — admin/manager only
 */
router.post('/', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const badge = await badgesService.createBadge(req.body);
    res.status(201).json({ success: true, data: badge, message: 'Badge created successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/badges/:id  — admin/manager only
 */
router.patch('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const badge = await badgesService.updateBadge(req.params.id as string, req.body);
    res.json({ success: true, data: badge, message: 'Badge updated successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/badges/:id  — admin only
 */
router.delete('/:id', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await badgesService.deleteBadge(req.params.id as string);
    res.json({ success: true, message: 'Badge deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
