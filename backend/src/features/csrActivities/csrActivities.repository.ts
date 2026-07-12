import db from '../../database/knex';
import { CsrActivityRecord, CreateCsrActivityInput, UpdateCsrActivityInput } from './csrActivities.types';

const TABLE_NAME = 'csr_activities';

export const csrActivitiesRepository = {
  async findMany(options: {
    limit: number;
    offset: number;
    departmentId?: string;
    categoryId?: string;
    status?: string;
  }): Promise<{ data: CsrActivityRecord[]; total: number }> {
    const query = db(TABLE_NAME).whereNull('deleted_at');

    if (options.departmentId) query.where('department_id', options.departmentId);
    if (options.categoryId) query.where('category_id', options.categoryId);
    if (options.status) query.where('status', options.status);

    const totalRes = await query.clone().count({ count: '*' }).first();
    const total = Number(totalRes?.count || 0);

    const data = await query
      .select('*')
      .limit(options.limit)
      .offset(options.offset)
      .orderBy('date', 'desc');

    return { data, total };
  },

  async findById(id: string): Promise<CsrActivityRecord | undefined> {
    return db(TABLE_NAME).where({ id }).whereNull('deleted_at').first();
  },

  async create(data: CreateCsrActivityInput): Promise<CsrActivityRecord> {
    const [record] = await db(TABLE_NAME).insert(data).returning('*');
    return record;
  },

  async update(id: string, data: UpdateCsrActivityInput): Promise<CsrActivityRecord> {
    const [record] = await db(TABLE_NAME)
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    return record;
  },

  async softDelete(id: string): Promise<void> {
    await db(TABLE_NAME)
      .where({ id })
      .update({ deleted_at: db.fn.now(), updated_at: db.fn.now() });
  },

  async incrementJoinedCount(id: string, amount: number = 1): Promise<void> {
    await db(TABLE_NAME).where({ id }).increment('joined_count', amount);
  },

  async decrementJoinedCount(id: string, amount: number = 1): Promise<void> {
    await db(TABLE_NAME).where({ id }).decrement('joined_count', amount);
  }
};
