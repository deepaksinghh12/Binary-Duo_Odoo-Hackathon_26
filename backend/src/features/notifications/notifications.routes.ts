import { Router, Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';
import { authenticate } from '../../middleware/authenticate';

const router = Router();
const notificationsService = new NotificationsService();

// Get current user's notifications
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const result = await notificationsService.getUserNotifications(userId, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const notification = await notificationsService.markAsRead(String(req.params.id), userId);
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.post('/mark-all-read', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await notificationsService.markAllAsRead(userId);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
