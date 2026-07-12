import db from '../../database/knex';
import { RecentActivityItem, DepartmentRankingItem } from './dashboard.types';

export const dashboardRepository = {
  /**
   * Safe helper to check if a database table exists.
   */
  async tableExists(tableName: string): Promise<boolean> {
    return db.schema.hasTable(tableName);
  },

  /**
   * Get total carbon emissions from carbon_transactions.
   */
  async getTotalEmissions(): Promise<number> {
    const exists = await this.tableExists('carbon_transactions');
    if (!exists) return 0;

    const result = await db('carbon_transactions')
      .sum('co2e_calculated as total')
      .first() as any;

    return Number(result?.total ?? 0);
  },

  /**
   * Get emission trends for the last 12 months.
   */
  async getMonthlyEmissions(): Promise<{ month: string; emission: number }[]> {
    const exists = await this.tableExists('carbon_transactions');
    if (!exists) return [];

    // Knex query grouping by month/year
    const results = await db('carbon_transactions')
      .select(
        db.raw("to_char(transaction_date, 'Mon YYYY') as month"),
        db.raw('sum(co2e_calculated) as total')
      )
      .groupByRaw("to_char(transaction_date, 'Mon YYYY'), min(transaction_date)")
      .orderByRaw('min(transaction_date) asc')
      .limit(12) as any[];

    return results.map((r) => ({
      month: String(r.month),
      emission: Number(r.total ?? 0),
    }));
  },

  /**
   * Fetch active departments and aggregate their metrics if available.
   */
  async getDepartmentsList(): Promise<{ id: string; name: string; code: string }[]> {
    const exists = await this.tableExists('departments');
    if (!exists) return [];

    return db('departments')
      .select('id', 'name', 'code')
      .whereNull('deleted_at')
      .where({ status: 'active' });
  },

  /**
   * Fetch recent activities from the activity_log table (Max 10 records).
   * Per Backend Alignment Addendum: use activity_log for the dashboard activity feed
   */
  async getRecentActivities(): Promise<RecentActivityItem[]> {
    const exists = await this.tableExists('activity_log');
    if (!exists) return [];

    const activities = await db('activity_log')
      .select('id', 'type', 'message', 'entity_type', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(10);

    return activities.map((a: any) => ({
      id: String(a.id),
      type: String(a.type) as 'carbon_transaction' | 'challenge' | 'compliance' | 'csr' | 'policy',
      title: String(a.message).substring(0, 100), // First 100 chars as title
      description: String(a.message),
      timestamp: new Date(a.created_at),
    }));
  },
};
export default dashboardRepository;
