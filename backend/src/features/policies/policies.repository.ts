import db from '../../database/knex';
import { PolicyRecord, CreatePolicyInput, UpdatePolicyInput } from './policies.types';

const TABLE_NAME = 'policies';

export const policiesRepository = {
  async findMany(options: {
    limit: number;
    offset: number;
    departmentId?: string;
    status?: string;
  }): Promise<{ data: PolicyRecord[]; total: number }> {
    const query = db(TABLE_NAME).whereNull('deleted_at');

    if (options.departmentId) {
      query.where(function() {
        this.where('department_id', options.departmentId).orWhereNull('department_id');
      });
    }
    if (options.status) query.where('status', options.status);

    const totalRes = await query.clone().count({ count: '*' }).first();
    const total = Number(totalRes?.count || 0);

    const data = await query
      .select('*')
      .limit(options.limit)
      .offset(options.offset)
      .orderBy('title', 'asc');

    return { data, total };
  },

  async findById(id: string): Promise<PolicyRecord | undefined> {
    return db(TABLE_NAME).where({ id }).whereNull('deleted_at').first();
  },

  async create(data: CreatePolicyInput): Promise<PolicyRecord> {
    const [record] = await db(TABLE_NAME).insert(data).returning('*');
    return record;
  },

  async update(id: string, data: UpdatePolicyInput): Promise<PolicyRecord> {
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
  }
};
