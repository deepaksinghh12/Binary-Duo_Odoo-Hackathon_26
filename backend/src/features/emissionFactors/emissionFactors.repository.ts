import db from '../../database/knex';
import { EmissionFactorRecord, CreateEmissionFactorInput, UpdateEmissionFactorInput } from './emissionFactors.types';

export const emissionFactorsRepository = {
  /**
   * Fetch paginated list of active emission factors with optional search/type filter.
   */
  async findMany(params: {
    limit: number;
    offset: number;
    search?: string;
    activityType?: string;
  }): Promise<{ data: EmissionFactorRecord[]; total: number }> {
    const query = db<EmissionFactorRecord>('emission_factors')
      .whereNull('deleted_at');

    if (params.search) {
      const searchPattern = `%${params.search}%`;
      query.andWhere((q) => {
        q.where('name', 'like', searchPattern)
         .orWhere('source', 'like', searchPattern);
      });
    }

    if (params.activityType) {
      query.andWhere({ activity_type: params.activityType });
    }

    // Clone query for counting total before limit/offset
    const totalQuery = query.clone().count('* as count').first() as any;
    
    const data = await query
      .select('*')
      .orderBy('name', 'asc')
      .limit(params.limit)
      .offset(params.offset);

    const totalRes = await totalQuery;
    const total = Number(totalRes?.count ?? 0);

    return { data, total };
  },

  /**
   * Fetch a single active emission factor by ID.
   */
  async findById(id: string): Promise<EmissionFactorRecord | undefined> {
    return db<EmissionFactorRecord>('emission_factors')
      .where({ id })
      .whereNull('deleted_at')
      .first();
  },

  /**
   * Create a new emission factor.
   */
  async create(input: CreateEmissionFactorInput): Promise<EmissionFactorRecord> {
    const [created] = await db<EmissionFactorRecord>('emission_factors')
      .insert({
        name: input.name,
        activity_type: input.activity_type,
        unit: input.unit,
        co2e_factor: input.co2e_factor,
        source: input.source || null,
        status: input.status || 'active',
      })
      .returning('*');
    return created;
  },

  /**
   * Update an existing emission factor.
   */
  async update(id: string, input: UpdateEmissionFactorInput): Promise<EmissionFactorRecord> {
    const [updated] = await db<EmissionFactorRecord>('emission_factors')
      .where({ id })
      .update({
        ...input,
        updated_at: new Date(),
      })
      .returning('*');
    return updated;
  },

  /**
   * Soft-delete an emission factor by setting deleted_at.
   */
  async softDelete(id: string): Promise<void> {
    await db('emission_factors')
      .where({ id })
      .update({
        deleted_at: new Date(),
        updated_at: new Date(),
      });
  },
};
export default emissionFactorsRepository;
