import db from '../../database/knex';
import { EnvironmentalGoalRecord, CreateEnvironmentalGoalInput, UpdateEnvironmentalGoalInput } from './environmentalGoals.types';

export const environmentalGoalsRepository = {
  /**
   * Safe helper to check if table exists.
   */
  async tableExists(tableName: string): Promise<boolean> {
    return db.schema.hasTable(tableName);
  },

  /**
   * Fetch paginated list of active environmental goals with dynamically calculated currentCO2.
   */
  async findMany(params: {
    limit: number;
    offset: number;
    departmentId?: string;
  }): Promise<{ data: any[]; total: number }> {
    const query = db('environmental_goals as eg')
      .leftJoin('departments as d', 'eg.department_id', 'd.id')
      .whereNull('eg.deleted_at')
      .whereNull('d.deleted_at');

    if (params.departmentId) {
      query.andWhere({ 'eg.department_id': params.departmentId });
    }

    const totalQuery = query.clone().count('eg.id as count').first() as any;

    // Subquery to dynamically sum co2e_calculated from carbon_transactions since goal creation
    const currentCo2Subquery = db('carbon_transactions')
      .sum('co2e_calculated')
      .whereRaw('department_id = eg.department_id')
      .andWhereRaw('transaction_date >= eg.created_at')
      .as('currentCO2');

    const data = await query
      .select(
        'eg.*',
        'd.name as department_name',
        currentCo2Subquery
      )
      .orderBy('eg.target_date', 'asc')
      .limit(params.limit)
      .offset(params.offset);

    const totalRes = await totalQuery;
    const total = Number(totalRes?.count ?? 0);

    return { data, total };
  },

  /**
   * Fetch a single active environmental goal by ID.
   */
  async findById(id: string): Promise<any | undefined> {
    const currentCo2Subquery = db('carbon_transactions')
      .sum('co2e_calculated')
      .whereRaw('department_id = eg.department_id')
      .andWhereRaw('transaction_date >= eg.created_at')
      .as('currentCO2');

    return db('environmental_goals as eg')
      .leftJoin('departments as d', 'eg.department_id', 'd.id')
      .select('eg.*', 'd.name as department_name', currentCo2Subquery)
      .where('eg.id', id)
      .whereNull('eg.deleted_at')
      .first();
  },

  /**
   * Create a new environmental goal.
   */
  async create(input: CreateEnvironmentalGoalInput): Promise<EnvironmentalGoalRecord> {
    const [created] = await db<EnvironmentalGoalRecord>('environmental_goals')
      .insert({
        department_id: input.department_id,
        target_metric: input.target_metric,
        target_value: input.target_value,
        target_date: input.target_date,
        current_progress: input.current_progress || 0,
        status: input.status || 'active',
      })
      .returning('*');
    return created;
  },

  /**
   * Update an existing environmental goal.
   */
  async update(id: string, input: UpdateEnvironmentalGoalInput): Promise<EnvironmentalGoalRecord> {
    const [updated] = await db<EnvironmentalGoalRecord>('environmental_goals')
      .where({ id })
      .update({
        ...input,
        updated_at: new Date(),
      })
      .returning('*');
    return updated;
  },

  /**
   * Soft-delete an environmental goal.
   */
  async softDelete(id: string): Promise<void> {
    await db('environmental_goals')
      .where({ id })
      .update({
        deleted_at: new Date(),
        updated_at: new Date(),
      });
  },
};
export default environmentalGoalsRepository;
