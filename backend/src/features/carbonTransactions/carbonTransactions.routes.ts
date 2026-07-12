import { Router, Request, Response, NextFunction } from 'express';
import { carbonTransactionsService } from './carbonTransactions.service';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';


const router = Router();

router.use(authenticate);

// List transactions
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    const result = await carbonTransactionsService.listTransactions({
      page,
      limit,
      departmentId: req.query.departmentId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      sourceType: req.query.sourceType as string,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Dashboard summary
router.get('/dashboard-summary', async (req, res, next) => {
  try {
    const summary = await carbonTransactionsService.getDashboardSummary({
      departmentId: req.query.departmentId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    });
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// Create transaction (manual)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Pass role and userId to enforce permissions
    const transaction = await carbonTransactionsService.createTransaction(
      req.body,
      req.user!.role,
      req.user!.userId
    );
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

export default router;
