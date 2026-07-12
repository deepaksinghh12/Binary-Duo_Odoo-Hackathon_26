import { complianceRecordsRepository } from './complianceRecords.repository';
import { CreateComplianceRecordInput, UpdateComplianceRecordInput } from './complianceRecords.types';
import { validate } from '../../utils/validate';
import { createComplianceRecordSchema, updateComplianceRecordSchema } from './complianceRecords.validation';
import { NotFoundError } from '../../shared/errors';
import { policiesRepository } from '../policies/policies.repository';

export const complianceRecordsService = {
  async listRecords(params: {
    page: number;
    limit: number;
    entityType?: string;
    entityId?: string;
    policyId?: string;
    status?: string;
  }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, Math.min(100, params.limit));
    const offset = (page - 1) * limit;

    const { data, total } = await complianceRecordsRepository.findMany({
      limit,
      offset,
      entityType: params.entityType,
      entityId: params.entityId,
      policyId: params.policyId,
      status: params.status,
    });

    return {
      records: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getRecord(id: string) {
    const record = await complianceRecordsRepository.findById(id);
    if (!record) throw new NotFoundError('Compliance Record');
    return record;
  },

  async createRecord(input: any) {
    const payload = validate(createComplianceRecordSchema, input);

    const policy = await policiesRepository.findById(payload.policy_id);
    if (!policy) throw new NotFoundError('Policy');
    
    return complianceRecordsRepository.create({
      ...payload,
      last_checked: payload.last_checked ? new Date(payload.last_checked) : null
    } as CreateComplianceRecordInput);
  },

  async updateRecord(id: string, input: any) {
    const record = await this.getRecord(id);
    const payload = validate(updateComplianceRecordSchema, input);

    const updateData: any = { ...payload };
    if (payload.last_checked) {
      updateData.last_checked = new Date(payload.last_checked);
    }

    return complianceRecordsRepository.update(record.id, updateData);
  },

  async deleteRecord(id: string) {
    const record = await this.getRecord(id);
    await complianceRecordsRepository.delete(record.id);
  },
};
