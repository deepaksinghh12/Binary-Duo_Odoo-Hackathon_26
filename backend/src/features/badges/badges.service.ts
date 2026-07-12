import { badgesRepository } from './badges.repository';
import { createBadgeSchema, updateBadgeSchema } from './badges.validation';
import { NotFoundError } from '../../shared/errors';
import type { Badge, CreateBadgeDto, UpdateBadgeDto } from './badges.types';

export const badgesService = {
  async listBadges(params: { page: number; limit: number; search?: string }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, Math.min(100, params.limit));
    const offset = (page - 1) * limit;

    const { data, total } = await badgesRepository.findAll({
      limit,
      offset,
      search: params.search,
    });

    return {
      badges: data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  /**
   * Gallery view — returns all badges with locked/unlocked state per requesting employee.
   */
  async listBadgesForEmployee(
    employeeId: string,
    params: { page: number; limit: number }
  ) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, Math.min(100, params.limit));
    const offset = (page - 1) * limit;

    const { data, total } = await badgesRepository.findAllWithEmployeeStatus(employeeId, {
      limit,
      offset,
    });

    return {
      badges: data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async getBadge(id: string): Promise<Badge> {
    const badge = await badgesRepository.findById(id);
    if (!badge) throw new NotFoundError('Badge');
    return badge;
  },

  async createBadge(input: unknown): Promise<Badge> {
    const payload = createBadgeSchema.parse(input) as CreateBadgeDto;
    return badgesRepository.create(payload);
  },

  async updateBadge(id: string, input: unknown): Promise<Badge> {
    await this.getBadge(id); // ensure exists
    const payload = updateBadgeSchema.parse(input) as UpdateBadgeDto;
    const updated = await badgesRepository.update(id, payload);
    if (!updated) throw new NotFoundError('Badge');
    return updated;
  },

  async deleteBadge(id: string): Promise<void> {
    await this.getBadge(id); // ensure exists
    const deleted = await badgesRepository.softDelete(id);
    if (!deleted) throw new NotFoundError('Badge');
  },

  async getMyBadges(employeeId: string): Promise<Badge[]> {
    return badgesRepository.findEmployeeBadges(employeeId);
  },
};
