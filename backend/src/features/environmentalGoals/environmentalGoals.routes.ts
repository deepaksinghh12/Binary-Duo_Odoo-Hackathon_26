import { Router, Request, Response, NextFunction } from 'express';
import { environmentalGoalsService } from './environmentalGoals.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';


const router = Router();

router.use(authenticate);

// List goals
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const departmentId = req.query.departmentId as string;
    
    const result = await environmentalGoalsService.listGoals({ page, limit, departmentId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get single goal
router.get('/:id', async (req, res, next) => {
  try {
    const goal = await environmentalGoalsService.getGoal((req.params.id as string));
    res.json(goal);
  } catch (err) {
    next(err);
  }
});

// Create goal (admin/manager only)
router.post('/', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await environmentalGoalsService.createGoal(req.body);
    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
});

// Update goal (admin/manager only)
router.patch('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await environmentalGoalsService.updateGoal((req.params.id as string), req.body);
    res.json(goal);
  } catch (err) {
    next(err);
  }
});

// Delete goal (admin/manager only)
router.delete('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await environmentalGoalsService.deleteGoal((req.params.id as string));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
