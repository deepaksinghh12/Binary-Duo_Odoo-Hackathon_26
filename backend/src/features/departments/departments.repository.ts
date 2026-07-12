import db from '../../database/knex';
import { DepartmentRecord } from './departments.types';

export const departmentsRepository = {
  /**
   * Find many departments with search, filtering, sorting, and pagination.
   */
  async findMany(params: {
    page: number;
    limit: number;
    offset: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: DepartmentRecord[]; total: number }> {
    const query = db<DepartmentRecord>('departments').whereNull('deleted_at');

    // Search query matches name or code
    if (params.search) {
      query.andWhere((qb) => {
        qb.where('name', 'ilike', `%${params.search}%`)
          .orWhere('code', 'ilike', `%${params.search}%`);
      });
    }

    // Get total count first
    const countQuery = await query.clone().count('id as count').first() as any;
    const total = parseInt(countQuery?.count ?? '0', 10);

    // Sorting parameters
    const validSortFields = ['name', 'code', 'employee_count', 'created_at'];
    const sortBy = validSortFields.includes(params.sortBy ?? '') ? (params.sortBy as string) : 'created_at';
    const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

    const data = await query
      .orderBy(sortBy, sortOrder)
      .limit(params.limit)
      .offset(params.offset);

    return { data, total };
  },

  /**
   * Find a department by ID.
   */
  async findById(id: string): Promise<DepartmentRecord | undefined> {
    return db<DepartmentRecord>('departments')
      .where({ id })
      .whereNull('deleted_at')
      .first();
  },

  /**
   * Find a department by Code.
   */
  async findByCode(code: string): Promise<DepartmentRecord | undefined> {
    return db<DepartmentRecord>('departments')
      .where({ code })
      .whereNull('deleted_at')
      .first();
  },

  /**
   * Create a new department.
   */
  async create(data: {
    name: string;
    code: string;
    head_user_id: string | null;
    parent_department_id: string | null;
    status: string;
  }): Promise<DepartmentRecord> {
    const [created] = await db<DepartmentRecord>('departments')
      .insert(data)
      .returning('*');
    return created;
  },

  /**
   * Update department properties.
   */
  async update(id: string, data: Partial<DepartmentRecord>): Promise<DepartmentRecord | undefined> {
    const [updated] = await db<DepartmentRecord>('departments')
      .where({ id })
      .whereNull('deleted_at')
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return updated;
  },

  /**
   * Soft-delete a department.
   */
  async softDelete(id: string): Promise<void> {
    await db('departments')
      .where({ id })
      .update({ deleted_at: new Date() });
  },

  /**
   * Check if a parent department exists and is active.
   */
  async existsAndActive(id: string): Promise<boolean> {
    const dept = await db('departments')
      .where({ id, status: 'active' })
      .whereNull('deleted_at')
      .first();
    return !!dept;
  },
};
