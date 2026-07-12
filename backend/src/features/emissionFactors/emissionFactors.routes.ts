import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { emissionFactorsService } from './emissionFactors.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

// Apply auth middleware to all emission factors routes
router.use(authenticate);

/**
 * @route   GET /api/emission-factors
 * @desc    Fetch paginated emission factors
 * @access  Private (Authenticated users)
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const search = req.query.search ? String(req.query.search) : undefined;
      const activityType = req.query.activityType ? String(req.query.activityType) : undefined;

      const data = await emissionFactorsService.listFactors({ page, limit, search, activityType });
      sendSuccess(res, data, 'Emission factors listed successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/emission-factors/:id
 * @desc    Get a specific emission factor record
 * @access  Private (Authenticated users)
 */
router.get(
  '/:id',
  async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = await emissionFactorsService.getFactor(id);
      sendSuccess(res, data, 'Emission factor retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/emission-factors
 * @desc    Create a new emission factor
 * @access  Private (Admin / Manager only)
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await emissionFactorsService.createFactor(req.body);
      sendSuccess(res, data, 'Emission factor created successfully', 201);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/emission-factors/:id
 * @desc    Update an emission factor
 * @access  Private (Admin / Manager only)
 */
router.put(
  '/:id',
  authorize('admin', 'manager'),
  async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = await emissionFactorsService.updateFactor(id, req.body);
      sendSuccess(res, data, 'Emission factor updated successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/emission-factors/:id
 * @desc    Soft-delete an emission factor
 * @access  Private (Admin / Manager only)
 */
router.delete(
  '/:id',
  authorize('admin', 'manager'),
  async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await emissionFactorsService.deleteFactor(id);
      sendSuccess(res, null, 'Emission factor deleted successfully');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
