import { policiesRepository } from './policies.repository';
import { CreatePolicyInput, UpdatePolicyInput } from './policies.types';
import { validate } from '../../utils/validate';
import { createPolicySchema, updatePolicySchema } from './policies.validation';
import { NotFoundError } from '../../shared/errors';

export const policiesService = {
  async listPolicies(params: {
    page: number;
    limit: number;
    departmentId?: string;
    status?: string;
  }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, Math.min(100, params.limit));
    const offset = (page - 1) * limit;

    const { data, total } = await policiesRepository.findMany({
      limit,
      offset,
      departmentId: params.departmentId,
      status: params.status,
    });

    return {
      policies: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getPolicy(id: string) {
    const policy = await policiesRepository.findById(id);
    if (!policy) throw new NotFoundError('Policy');
    return policy;
  },

  async createPolicy(input: any) {
    const payload = validate(createPolicySchema, input);
    
    return policiesRepository.create({
      ...payload,
      description: payload.description ?? null,
      url: payload.url ?? null,
      department_id: payload.department_id ?? null,
    } as CreatePolicyInput);
  },

  async updatePolicy(id: string, input: any) {
    const policy = await this.getPolicy(id);
    const payload = validate(updatePolicySchema, input);

    return policiesRepository.update(policy.id, payload as UpdatePolicyInput);
  },

  async deletePolicy(id: string) {
    const policy = await this.getPolicy(id);
    await policiesRepository.softDelete(policy.id);
  },
};
