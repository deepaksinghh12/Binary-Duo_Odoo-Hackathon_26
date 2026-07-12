import { Router, Request, Response, NextFunction } from 'express';
import { DepartmentScoresService } from './departmentScores.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();
const scoresService = new DepartmentScoresService();

// Get all department scores or specific department
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department_id } = req.query;
    const scores = await scoresService.calculateDepartmentScores(department_id as string);
    res.status(200).json({ success: true, data: scores });
  } catch (error) {
    next(error);
  }
});

// Recalculate scores (admin/manager only)
router.post('/recalculate', authenticate, authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await scoresService.invalidateCache();
    const scores = await scoresService.calculateDepartmentScores();
    res.status(200).json({ success: true, data: scores, message: 'Scores recalculated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
