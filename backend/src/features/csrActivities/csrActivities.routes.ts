import { Router, Request, Response, NextFunction } from 'express';
import { csrActivitiesService } from './csrActivities.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

// List activities
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    const result = await csrActivitiesService.listActivities({
      page,
      limit,
      departmentId: req.query.departmentId as string,
      categoryId: req.query.categoryId as string,
      status: req.query.status as string,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get single activity
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await csrActivitiesService.getActivity(req.params.id as string);
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

// Create activity (admin/manager only)
router.post('/', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await csrActivitiesService.createActivity(req.body);
    res.status(201).json(activity);
  } catch (err) {
    next(err);
  }
});

// Update activity (admin/manager only)
router.patch('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await csrActivitiesService.updateActivity(req.params.id as string, req.body);
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

// Soft Delete (admin/manager only)
router.delete('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await csrActivitiesService.deleteActivity(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
