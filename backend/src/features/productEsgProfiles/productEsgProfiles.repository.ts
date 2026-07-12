import db from '../../database/knex';
import { ProductEsgProfileRecord, CreateProductEsgProfileInput, UpdateProductEsgProfileInput } from './productEsgProfiles.types';

const TABLE_NAME = 'product_esg_profiles';

export const productEsgProfilesRepository = {
  async findMany(options: { limit: number; offset: number }): Promise<{ data: ProductEsgProfileRecord[]; total: number }> {
    const query = db(TABLE_NAME).whereNull('deleted_at');

    const totalRes = await query.clone().count({ count: '*' }).first();
    const total = Number(totalRes?.count || 0);

    const data = await query
      .select('*')
      .limit(options.limit)
      .offset(options.offset)
      .orderBy('created_at', 'desc');

    return { data, total };
  },

  async findById(id: string): Promise<ProductEsgProfileRecord | undefined> {
    return db(TABLE_NAME)
      .where({ id })
      .whereNull('deleted_at')
      .first();
  },

  async create(data: CreateProductEsgProfileInput): Promise<ProductEsgProfileRecord> {
    const [record] = await db(TABLE_NAME).insert(data).returning('*');
    return record;
  },

  async update(id: string, data: UpdateProductEsgProfileInput): Promise<ProductEsgProfileRecord> {
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
  },
};
