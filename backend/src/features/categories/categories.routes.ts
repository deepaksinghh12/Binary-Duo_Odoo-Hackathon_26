import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Request } from 'express';
import { categoriesService } from './categories.service';
import { sendSuccess, sendPaginated, parsePagination } from '../../utils/response';
import { CategoryType } from './categories.types';

const router = Router();

// Apply session authentication to all category routes
router.use(authenticate);

/**
 * @route   GET /api/categories
 * @desc    Get all categories (paginated, search-enabled, filterable by type)
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
      const type = req.query.type as CategoryType;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc';

      const { data, total } = await categoriesService.listCategories({
        page,
        limit,
        offset,
        search,
        type,
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
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Private (Registered users)
 */
router.get(
  '/:id',
  async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await categoriesService.getCategory(req.params.id);
      sendSuccess(res, data, 'Category fetched successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private (Admin / Manager only)
 */
router.post(
  '/',
  authorize('admin', 'manager') as any,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await categoriesService.createCategory(req.body);
      sendSuccess(res, data, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Private (Admin / Manager only)
 */
router.put(
  '/:id',
  authorize('admin', 'manager') as any,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await categoriesService.updateCategory(req.params.id, req.body);
      sendSuccess(res, data, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Soft-delete a category
 * @access  Private (Admin / Manager only)
 */
router.delete(
  '/:id',
  authorize('admin', 'manager') as any,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await categoriesService.deleteCategory(req.params.id);
      sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
