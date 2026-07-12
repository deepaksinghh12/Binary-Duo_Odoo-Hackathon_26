import db from '../../database/knex';
import { AuditRecord, CreateAuditInput, UpdateAuditInput } from './audits.types';

const TABLE_NAME = 'audits';

export const auditsRepository = {
  async findMany(options: {
    limit: number;
    offset: number;
    auditorId?: string;
    status?: string;
  }): Promise<{ data: AuditRecord[]; total: number }> {
    const query = db(TABLE_NAME).whereNull('deleted_at');

    if (options.auditorId) query.where('auditor_id', options.auditorId);
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

  async findById(id: string): Promise<AuditRecord | undefined> {
    return db(TABLE_NAME).where({ id }).whereNull('deleted_at').first();
  },

  async create(data: CreateAuditInput): Promise<AuditRecord> {
    const [record] = await db(TABLE_NAME).insert(data).returning('*');
    return record;
  },

  async update(id: string, data: UpdateAuditInput): Promise<AuditRecord> {
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
