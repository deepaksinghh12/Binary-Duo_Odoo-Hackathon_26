import { emissionFactorsRepository } from './emissionFactors.repository';
import { EmissionFactorRecord, CreateEmissionFactorInput, UpdateEmissionFactorInput } from './emissionFactors.types';
import { validate } from '../../utils/validate';
import { createEmissionFactorSchema, updateEmissionFactorSchema } from './emissionFactors.validation';
import { NotFoundError } from '../../shared/errors';

export const emissionFactorsService = {
  /**
   * List factors with query filters and pagination.
   */
  async listFactors(params: {
    page: number;
    limit: number;
    search?: string;
    activityType?: string;
  }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, Math.min(100, params.limit));
    const offset = (page - 1) * limit;

    const { data, total } = await emissionFactorsRepository.findMany({
      limit,
      offset,
      search: params.search,
      activityType: params.activityType,
    });

    return {
      factors: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Fetch a single active emission factor.
   */
  async getFactor(id: string): Promise<EmissionFactorRecord> {
    const factor = await emissionFactorsRepository.findById(id);
    if (!factor) {
      throw new NotFoundError('Emission Factor');
    }
    return factor;
  },

  /**
   * Create a new emission factor record.
   */
  async createFactor(input: CreateEmissionFactorInput): Promise<EmissionFactorRecord> {
    const payload = validate(createEmissionFactorSchema, input);
    return emissionFactorsRepository.create(payload);
  },

  /**
   * Update an existing emission factor.
   */
  async updateFactor(id: string, input: UpdateEmissionFactorInput): Promise<EmissionFactorRecord> {
    const factor = await this.getFactor(id); // Throws NotFoundError if not found
    const payload = validate(updateEmissionFactorSchema, input);
    return emissionFactorsRepository.update(factor.id, payload);
  },

  /**
   * Soft-delete an emission factor.
   */
  async deleteFactor(id: string): Promise<void> {
    const factor = await this.getFactor(id);
    await emissionFactorsRepository.softDelete(factor.id);
  },
};
export default emissionFactorsService;
