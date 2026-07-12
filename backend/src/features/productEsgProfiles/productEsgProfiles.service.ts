import { productEsgProfilesRepository } from './productEsgProfiles.repository';
import { CreateProductEsgProfileInput, UpdateProductEsgProfileInput } from './productEsgProfiles.types';
import { validate } from '../../utils/validate';
import { createProductEsgProfileSchema, updateProductEsgProfileSchema } from './productEsgProfiles.validation';
import { NotFoundError } from '../../shared/errors';

export const productEsgProfilesService = {
  async listProfiles(params: { page: number; limit: number }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, Math.min(100, params.limit));
    const offset = (page - 1) * limit;

    const { data, total } = await productEsgProfilesRepository.findMany({ limit, offset });

    return {
      profiles: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getProfile(id: string) {
    const profile = await productEsgProfilesRepository.findById(id);
    if (!profile) throw new NotFoundError('Product ESG Profile');
    return profile;
  },

  async createProfile(input: CreateProductEsgProfileInput) {
    const payload = validate(createProductEsgProfileSchema, input);
    return productEsgProfilesRepository.create({
      ...payload,
      notes: payload.notes ?? null,
    });
  },

  async updateProfile(id: string, input: UpdateProductEsgProfileInput) {
    const profile = await this.getProfile(id); // Ensure exists
    const payload = validate(updateProductEsgProfileSchema, input);
    return productEsgProfilesRepository.update(profile.id, payload);
  },

  async deleteProfile(id: string) {
    const profile = await this.getProfile(id);
    await productEsgProfilesRepository.softDelete(profile.id);
  },
};
