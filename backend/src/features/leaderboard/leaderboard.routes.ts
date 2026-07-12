import { Router, Request, Response, NextFunction } from 'express';
import { LeaderboardService } from './leaderboard.service';
import { authenticate } from '../../middleware/authenticate';

const router = Router();
const leaderboardService = new LeaderboardService();

// Combined leaderboard (individuals + departments ranked together)
router.get('/combined', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await leaderboardService.getCombinedLeaderboard(req.query);
    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
});

// Individual-only leaderboard
router.get('/individuals', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await leaderboardService.getIndividualLeaderboard(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Default route (uses combined leaderboard)
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await leaderboardService.getCombinedLeaderboard(req.query);
    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
});

export default router;
