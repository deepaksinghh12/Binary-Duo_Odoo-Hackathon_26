import { csrActivitiesRepository } from './csrActivities.repository';
import { CreateCsrActivityInput, UpdateCsrActivityInput } from './csrActivities.types';
import { validate } from '../../utils/validate';
import { createCsrActivitySchema, updateCsrActivitySchema } from './csrActivities.validation';
import { NotFoundError } from '../../shared/errors';
import { settingsService } from '../settings/settings.service';

export const csrActivitiesService = {
  async listActivities(params: {
    page: number;
    limit: number;
    departmentId?: string;
    categoryId?: string;
    status?: string;
  }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, Math.min(100, params.limit));
    const offset = (page - 1) * limit;

    const { data, total } = await csrActivitiesRepository.findMany({
      limit,
      offset,
      departmentId: params.departmentId,
      categoryId: params.categoryId,
      status: params.status,
    });

    return {
      activities: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getActivity(id: string) {
    const activity = await csrActivitiesRepository.findById(id);
    if (!activity) throw new NotFoundError('CSR Activity');
    return activity;
  },

  async createActivity(input: any) {
    const payload = validate(createCsrActivitySchema, input);

    // If evidence_required is null, resolve from global setting
    if (payload.evidence_required === null || payload.evidence_required === undefined) {
      const setting = await settingsService.getSetting('csr_evidence_required');
      payload.evidence_required = setting?.value === 'true';
    }

    return csrActivitiesRepository.create({
      ...payload,
      date: new Date(payload.date),
      description: payload.description ?? null,
      evidence_required: payload.evidence_required ?? null,
    });
  },

  async updateActivity(id: string, input: any) {
    const activity = await this.getActivity(id);
    const payload = validate(updateCsrActivitySchema, input);

    if (payload.date) {
      payload.date = new Date(payload.date);
    }

    return csrActivitiesRepository.update(activity.id, payload as UpdateCsrActivityInput);
  },

  async deleteActivity(id: string) {
    const activity = await this.getActivity(id);
    await csrActivitiesRepository.softDelete(activity.id);
  },
};
