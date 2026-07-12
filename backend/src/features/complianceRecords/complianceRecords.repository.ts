import db from '../../database/knex';
import { ComplianceRecord, CreateComplianceRecordInput, UpdateComplianceRecordInput } from './complianceRecords.types';

const TABLE_NAME = 'compliance_records';

export const complianceRecordsRepository = {
  async findMany(options: {
    limit: number;
    offset: number;
    entityType?: string;
    entityId?: string;
    policyId?: string;
    status?: string;
  }): Promise<{ data: ComplianceRecord[]; total: number }> {
    const query = db(TABLE_NAME);

    if (options.entityType) query.where('entity_type', options.entityType);
    if (options.entityId) query.where('entity_id', options.entityId);
    if (options.policyId) query.where('policy_id', options.policyId);
    if (options.status) query.where('compliance_status', options.status);

    const totalRes = await query.clone().count({ count: '*' }).first();
    const total = Number(totalRes?.count || 0);

    const data = await query
      .select('*')
      .limit(options.limit)
      .offset(options.offset)
      .orderBy('created_at', 'desc');

    return { data, total };
  },

  async findById(id: string): Promise<ComplianceRecord | undefined> {
    return db(TABLE_NAME).where({ id }).first();
  },

  async create(data: CreateComplianceRecordInput): Promise<ComplianceRecord> {
    const [record] = await db(TABLE_NAME).insert(data).returning('*');
    return record;
  },

  async update(id: string, data: UpdateComplianceRecordInput): Promise<ComplianceRecord> {
    const [record] = await db(TABLE_NAME)
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    return record;
  },

  async delete(id: string): Promise<void> {
    await db(TABLE_NAME).where({ id }).delete();
  }
};
