import { Router, Request, Response, NextFunction } from 'express';
import { policiesService } from './policies.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

// List policies
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    const result = await policiesService.listPolicies({
      page,
      limit,
      departmentId: req.query.departmentId as string,
      status: req.query.status as string,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get single policy
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policy = await policiesService.getPolicy(req.params.id as string);
    res.json(policy);
  } catch (err) {
    next(err);
  }
});

// Create policy (admin/manager only)
router.post('/', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policy = await policiesService.createPolicy(req.body);
    res.status(201).json(policy);
  } catch (err) {
    next(err);
  }
});

// Update policy (admin/manager only)
router.patch('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policy = await policiesService.updatePolicy(req.params.id as string, req.body);
    res.json(policy);
  } catch (err) {
    next(err);
  }
});

// Delete policy (admin/manager only)
router.delete('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await policiesService.deletePolicy(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
