import { auditsRepository } from './audits.repository';
import { CreateAuditInput, UpdateAuditInput } from './audits.types';
import { validate } from '../../utils/validate';
import { createAuditSchema, updateAuditSchema } from './audits.validation';
import { NotFoundError } from '../../shared/errors';

export const auditsService = {
  async listAudits(params: {
    page: number;
    limit: number;
    auditorId?: string;
    status?: string;
  }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, Math.min(100, params.limit));
    const offset = (page - 1) * limit;

    const { data, total } = await auditsRepository.findMany({
      limit,
      offset,
      auditorId: params.auditorId,
      status: params.status,
    });

    return {
      audits: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getAudit(id: string) {
    const audit = await auditsRepository.findById(id);
    if (!audit) throw new NotFoundError('Audit');
    return audit;
  },

  async createAudit(input: any) {
    const payload = validate(createAuditSchema, input);

    return auditsRepository.create({
      ...payload,
      date: new Date(payload.date),
      findings: payload.findings ?? null,
      resolution: payload.resolution ?? null,
    } as CreateAuditInput);
  },

  async updateAudit(id: string, input: any) {
    const audit = await this.getAudit(id);
    const payload = validate(updateAuditSchema, input);

    const updateData: any = { ...payload };
    if (payload.date) {
      updateData.date = new Date(payload.date);
    }

    return auditsRepository.update(audit.id, updateData);
  },

  async deleteAudit(id: string) {
    const audit = await this.getAudit(id);
    await auditsRepository.softDelete(audit.id);
  },
};
