import { Router, Request, Response, NextFunction } from 'express';
import { RewardsService } from './rewards.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();
const rewardsService = new RewardsService();

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await rewardsService.getAllRewards(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reward = await rewardsService.getRewardById(String(req.params.id));
    res.status(200).json({ success: true, data: reward });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reward = await rewardsService.createReward(req.body);
    res.status(201).json({ success: true, data: reward, message: 'Reward created successfully' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticate, authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reward = await rewardsService.updateReward(String(req.params.id), req.body);
    res.status(200).json({ success: true, data: reward, message: 'Reward updated successfully' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rewardsService.deleteReward(String(req.params.id));
    res.status(200).json({ success: true, message: 'Reward deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/redeem', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user!.userId;
    const redemption = await rewardsService.redeemReward(String(req.params.id), employeeId);
    res.status(200).json({ success: true, data: redemption, message: 'Reward redeemed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
