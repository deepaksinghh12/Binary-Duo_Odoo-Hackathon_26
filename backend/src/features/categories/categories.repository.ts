import db from '../../database/knex';
import { CategoryRecord, CategoryType } from './categories.types';

export const categoriesRepository = {
  /**
   * Find many categories with search, filters, sorting, and pagination.
   */
  async findMany(params: {
    page: number;
    limit: number;
    offset: number;
    search?: string;
    type?: CategoryType;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: CategoryRecord[]; total: number }> {
    const query = db<CategoryRecord>('categories').whereNull('deleted_at');

    // Type filter
    if (params.type) {
      query.andWhere({ type: params.type });
    }

    // Name search
    if (params.search) {
      query.andWhere('name', 'ilike', `%${params.search}%`);
    }

    // Get total count
    const countQuery = await query.clone().count('id as count').first() as any;
    const total = parseInt(countQuery?.count ?? '0', 10);

    // Sorting parameters
    const validSortFields = ['name', 'type', 'status', 'created_at'];
    const sortBy = validSortFields.includes(params.sortBy ?? '') ? (params.sortBy as string) : 'created_at';
    const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

    const data = await query
      .orderBy(sortBy, sortOrder)
      .limit(params.limit)
      .offset(params.offset);

    return { data, total };
  },

  /**
   * Find a category by ID.
   */
  async findById(id: string): Promise<CategoryRecord | undefined> {
    return db<CategoryRecord>('categories')
      .where({ id })
      .whereNull('deleted_at')
      .first();
  },

  /**
   * Find a category by exact Name and Type.
   */
  async findByNameAndType(name: string, type: CategoryType): Promise<CategoryRecord | undefined> {
    return db<CategoryRecord>('categories')
      .where({ name, type })
      .whereNull('deleted_at')
      .first();
  },

  /**
   * Create a new category.
   */
  async create(data: {
    name: string;
    type: CategoryType;
    status: string;
  }): Promise<CategoryRecord> {
    const [created] = await db<CategoryRecord>('categories')
      .insert(data)
      .returning('*');
    return created;
  },

  /**
   * Update category properties.
   */
  async update(id: string, data: Partial<CategoryRecord>): Promise<CategoryRecord | undefined> {
    const [updated] = await db<CategoryRecord>('categories')
      .where({ id })
      .whereNull('deleted_at')
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return updated;
  },

  /**
   * Soft-delete a category.
   */
  async softDelete(id: string): Promise<void> {
    await db('categories')
      .where({ id })
      .update({ deleted_at: new Date() });
  },

  /**
   * Check if a category exists and is active.
   */
  async existsAndActive(id: string): Promise<boolean> {
    const category = await db('categories')
      .where({ id, status: 'active' })
      .whereNull('deleted_at')
      .first();
    return !!category;
  },
};
