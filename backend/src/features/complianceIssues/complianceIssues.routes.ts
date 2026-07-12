import { Router, Request, Response, NextFunction } from 'express';
import { complianceIssuesService } from './complianceIssues.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/compliance-issues/overdue
 * Returns all open issues past their due_date.
 * Must be defined BEFORE /:id to avoid route collision.
 */
router.get('/overdue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issues = await complianceIssuesService.getOverdueIssues();
    res.json({ success: true, data: issues, count: issues.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/compliance-issues
 * Filterable by: severity, status, owner_id, department_id, audit_id, page, limit
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await complianceIssuesService.listIssues(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/compliance-issues/:id
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issue = await complianceIssuesService.getIssue(req.params.id as string);
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/compliance-issues  — admin/manager only
 * owner_id and due_date are required; validation rejects without them.
 */
router.post('/', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issue = await complianceIssuesService.createIssue(req.body);
    res.status(201).json({ success: true, data: issue, message: 'Compliance issue created' });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/compliance-issues/:id  — admin/manager only
 */
router.patch('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issue = await complianceIssuesService.updateIssue(req.params.id as string, req.body);
    res.json({ success: true, data: issue, message: 'Compliance issue updated' });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/compliance-issues/:id  — admin only
 */
router.delete('/:id', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await complianceIssuesService.deleteIssue(req.params.id as string);
    res.json({ success: true, message: 'Compliance issue deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
