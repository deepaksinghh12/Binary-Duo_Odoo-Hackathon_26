import { Router, Request, Response, NextFunction } from 'express';
import { employeeParticipationService } from './employeeParticipation.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { AuthenticatedRequest } from '../../shared/types';
import { upload } from '../../middleware/upload';

const router = Router();

router.use(authenticate);

// List participations
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    // Default to own participations if employee, unless admin/manager
    const authReq = req as AuthenticatedRequest;
    const role = authReq.user.role;
    let employeeId = req.query.employeeId as string;
    
    if (role === 'employee') {
      employeeId = authReq.user.userId;
    }

    const result = await employeeParticipationService.listParticipations({
      page,
      limit,
      employeeId,
      csrActivityId: req.query.csrActivityId as string,
      approvalStatus: req.query.approvalStatus as string,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Join activity
router.post('/', upload.single('proof'), async (req: any, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    // Attach the uploaded file path to the request body if it exists
    const data = { ...req.body };
    if (req.file) {
      data.proof_file_url = `/uploads/${req.file.filename}`;
    }
    const participation = await employeeParticipationService.joinActivity(data, authReq.user.userId);
    res.status(201).json(participation);
  } catch (err) {
    next(err);
  }
});

// Approve participation (admin/manager only)
router.patch('/:id/approve', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await employeeParticipationService.approveParticipation(req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Reject participation (admin/manager only)
router.patch('/:id/reject', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await employeeParticipationService.rejectParticipation(req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
