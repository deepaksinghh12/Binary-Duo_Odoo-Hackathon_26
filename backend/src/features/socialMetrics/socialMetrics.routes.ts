import { Router, Request, Response, NextFunction } from 'express';
import { socialMetricsService } from './socialMetrics.service';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

// Get diversity metrics
router.get('/diversity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await socialMetricsService.getDiversityMetrics();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get training metrics
router.get('/training', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await socialMetricsService.getTrainingMetrics();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
