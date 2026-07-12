import { Router, Request, Response, NextFunction } from 'express';
import { auditsService } from './audits.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

// List audits
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    const result = await auditsService.listAudits({
      page,
      limit,
      auditorId: req.query.auditorId as string,
      status: req.query.status as string,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get single audit
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const audit = await auditsService.getAudit(req.params.id as string);
    res.json(audit);
  } catch (err) {
    next(err);
  }
});

// Create audit (admin/manager only)
router.post('/', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const audit = await auditsService.createAudit(req.body);
    res.status(201).json(audit);
  } catch (err) {
    next(err);
  }
});

// Update audit (admin/manager only)
router.patch('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const audit = await auditsService.updateAudit(req.params.id as string, req.body);
    res.json(audit);
  } catch (err) {
    next(err);
  }
});

// Delete audit (admin/manager only)
router.delete('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await auditsService.deleteAudit(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
