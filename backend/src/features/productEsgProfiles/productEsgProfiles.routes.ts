import { Router, Request, Response, NextFunction } from 'express';
import { productEsgProfilesService } from './productEsgProfiles.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';


const router = Router();

router.use(authenticate);

// List profiles
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    const result = await productEsgProfilesService.listProfiles({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get profile
router.get('/:id', async (req, res, next) => {
  try {
    const profile = await productEsgProfilesService.getProfile((req.params.id as string));
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// Create profile (admin/manager only)
router.post('/', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await productEsgProfilesService.createProfile(req.body);
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
});

// Update profile (admin/manager only)
router.patch('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await productEsgProfilesService.updateProfile((req.params.id as string), req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// Delete profile (admin/manager only)
router.delete('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productEsgProfilesService.deleteProfile((req.params.id as string));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
