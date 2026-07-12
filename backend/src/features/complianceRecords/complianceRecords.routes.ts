import { Router, Request, Response, NextFunction } from 'express';
import { complianceRecordsService } from './complianceRecords.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

// List records
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    const result = await complianceRecordsService.listRecords({
      page,
      limit,
      entityType: req.query.entityType as string,
      entityId: req.query.entityId as string,
      policyId: req.query.policyId as string,
      status: req.query.status as string,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get single record
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await complianceRecordsService.getRecord(req.params.id as string);
    res.json(record);
  } catch (err) {
    next(err);
  }
});

// Create record (admin/manager only)
router.post('/', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await complianceRecordsService.createRecord(req.body);
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

// Update record (admin/manager only)
router.patch('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await complianceRecordsService.updateRecord(req.params.id as string, req.body);
    res.json(record);
  } catch (err) {
    next(err);
  }
});

// Delete record (admin/manager only)
router.delete('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await complianceRecordsService.deleteRecord(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
