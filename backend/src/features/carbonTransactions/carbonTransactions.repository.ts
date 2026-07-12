import db from '../../database/knex';
import { CarbonTransactionRecord } from './carbonTransactions.types';

const TABLE_NAME = 'carbon_transactions';

export const carbonTransactionsRepository = {
  async findMany(options: { 
    limit: number; 
    offset: number; 
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    sourceType?: string;
  }): Promise<{ data: CarbonTransactionRecord[]; total: number }> {
    const query = db(TABLE_NAME).whereNull('deleted_at');

    if (options.departmentId) query.where('department_id', options.departmentId);
    if (options.sourceType) query.where('source_type', options.sourceType);
    if (options.startDate) query.where('transaction_date', '>=', options.startDate);
    if (options.endDate) query.where('transaction_date', '<=', options.endDate);

    const totalRes = await query.clone().count({ count: '*' }).first();
    const total = Number(totalRes?.count || 0);

    const data = await query
      .select('*')
      .limit(options.limit)
      .offset(options.offset)
      .orderBy('transaction_date', 'desc');

    return { data, total };
  },

  async create(data: Omit<CarbonTransactionRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<CarbonTransactionRecord> {
    const [record] = await db(TABLE_NAME).insert(data).returning('*');
    return record;
  },
  
  async getDashboardSummary(departmentId?: string, startDate?: string, endDate?: string) {
    const query = db(TABLE_NAME).whereNull('deleted_at');
    
    if (departmentId) query.where('department_id', departmentId);
    if (startDate) query.where('transaction_date', '>=', startDate);
    if (endDate) query.where('transaction_date', '<=', endDate);

    const result = await query
      .select('department_id')
      .sum('co2e_calculated as total_co2e')
      .groupBy('department_id');

    return result;
  }
};
