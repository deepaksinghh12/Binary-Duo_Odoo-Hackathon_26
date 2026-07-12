import { ConflictError, NotFoundError } from '../../shared/errors';
import { validate } from '../../utils/validate';
import { categoriesRepository } from './categories.repository';
import { CreateCategoryInput, UpdateCategoryInput, CategoryRecord, CategoryType } from './categories.types';
import { createCategorySchema, updateCategorySchema } from './categories.validation';

export const categoriesService = {
  /**
   * Fetch all active/non-deleted categories.
   */
  async listCategories(params: {
    page: number;
    limit: number;
    offset: number;
    search?: string;
    type?: CategoryType;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    return categoriesRepository.findMany(params);
  },

  /**
   * Create a new category.
   */
  async createCategory(input: CreateCategoryInput): Promise<CategoryRecord> {
    const payload = validate(createCategorySchema, input);

    // 1. Check if category with same name and type already exists
    const existing = await categoriesRepository.findByNameAndType(payload.name, payload.type);
    if (existing) {
      throw new ConflictError(`Category "${payload.name}" of type "${payload.type}" already exists`);
    }

    // 2. Create category
    return categoriesRepository.create({
      name: payload.name,
      type: payload.type,
      status: payload.status ?? 'active',
    });
  },

  /**
   * Get single category by ID.
   */
  async getCategory(id: string): Promise<CategoryRecord> {
    const category = await categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category');
    }
    return category;
  },

  /**
   * Update category details.
   */
  async updateCategory(id: string, input: UpdateCategoryInput): Promise<CategoryRecord> {
    const payload = validate(updateCategorySchema, input);

    // 1. Fetch current record
    const current = await categoriesRepository.findById(id);
    if (!current) {
      throw new NotFoundError('Category');
    }

    const updates: Partial<CategoryRecord> = {};

    // 2. Validate uniqueness if name or type changes
    const name = payload.name ?? current.name;
    const type = payload.type ?? current.type;

    if (payload.name !== undefined || payload.type !== undefined) {
      const existing = await categoriesRepository.findByNameAndType(name, type);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Category "${name}" of type "${type}" already exists`);
      }
      if (payload.name) updates.name = payload.name;
      if (payload.type) updates.type = payload.type;
    }

    if (payload.status) updates.status = payload.status;

    const updated = await categoriesRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError('Category');
    }
    return updated;
  },

  /**
   * Delete a category (soft delete).
   */
  async deleteCategory(id: string): Promise<void> {
    const current = await categoriesRepository.findById(id);
    if (!current) {
      throw new NotFoundError('Category');
    }
    await categoriesRepository.softDelete(id);
  },
};
