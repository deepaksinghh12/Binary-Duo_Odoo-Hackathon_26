import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Request } from 'express';
import { departmentsService } from './departments.service';
import { sendSuccess, sendPaginated, parsePagination } from '../../utils/response';

const router = Router();

// Apply session authentication to all department routes
router.use(authenticate);

/**
 * @route   GET /api/departments
 * @desc    Get all departments (paginated, sortable, search-enabled)
 * @access  Private (Registered users)
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, offset } = parsePagination(
        req.query.page as string,
        req.query.limit as string
      );
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc';

      const { data, total } = await departmentsService.listDepartments({
        page,
        limit,
        offset,
        search,
        sortBy,
        sortOrder,
      });

      sendPaginated(res, {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/departments/:id
 * @desc    Get single department by ID
 * @access  Private (Registered users)
 */
router.get(
  '/:id',
  async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await departmentsService.getDepartment(req.params.id);
      sendSuccess(res, data, 'Department fetched successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/departments
 * @desc    Create a new department
 * @access  Private (Admin / Manager only)
 */
router.post(
  '/',
  authorize('admin', 'manager') as any,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await departmentsService.createDepartment(req.body);
      sendSuccess(res, data, 'Department created successfully', 201);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update a department
 * @access  Private (Admin / Manager only)
 */
router.put(
  '/:id',
  authorize('admin', 'manager') as any,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await departmentsService.updateDepartment(req.params.id, req.body);
      sendSuccess(res, data, 'Department updated successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Soft-delete a department
 * @access  Private (Admin / Manager only)
 */
router.delete(
  '/:id',
  authorize('admin', 'manager') as any,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await departmentsService.deleteDepartment(req.params.id);
      sendSuccess(res, null, 'Department deleted successfully');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
