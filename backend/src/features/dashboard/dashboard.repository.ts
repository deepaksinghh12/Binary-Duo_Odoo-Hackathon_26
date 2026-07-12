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
   * Fetch recent activities from all tables (Max 10 records).
   */
  async getRecentActivities(): Promise<RecentActivityItem[]> {
    const activities: RecentActivityItem[] = [];

    // A. Carbon Transactions
    if (await this.tableExists('carbon_transactions')) {
      const carbon = await db('carbon_transactions')
        .select('id', 'activity_type as title', 'notes as description', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(10);

      carbon.forEach((c) => {
        activities.push({
          id: String(c.id),
          type: 'carbon_transaction',
          title: String(c.title),
          description: String(c.description || 'Carbon emission logged'),
          timestamp: new Date(c.created_at),
        });
      });
    }

    // B. Challenges
    if (await this.tableExists('challenges')) {
      const challenges = await db('challenges')
        .select('id', 'title', 'description', 'status', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(10);

      challenges.forEach((ch) => {
        activities.push({
          id: String(ch.id),
          type: 'challenge',
          title: String(ch.title),
          description: String(ch.description || 'New sustainability challenge started'),
          status: String(ch.status),
          timestamp: new Date(ch.created_at),
        });
      });
    }

    // C. CSR Activities
    if (await this.tableExists('csr_activities')) {
      const csr = await db('csr_activities')
        .select('id', 'title', 'description', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(10);

      csr.forEach((cs) => {
        activities.push({
          id: String(cs.id),
          type: 'csr',
          title: String(cs.title),
          description: String(cs.description || 'New CSR activity hosted'),
          timestamp: new Date(cs.created_at),
        });
      });
    }

    // D. Policies
    if (await this.tableExists('policies')) {
      const policies = await db('policies')
        .select('id', 'title', 'description', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(10);

      policies.forEach((p) => {
        activities.push({
          id: String(p.id),
          type: 'policy',
          title: String(p.title),
          description: String(p.description || 'ESG policy updated'),
          timestamp: new Date(p.created_at),
        });
      });
    }

    // E. Compliance Issues
    if (await this.tableExists('compliance_issues')) {
      const compliance = await db('compliance_issues')
        .select('id', 'title', 'description', 'status', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(10);

      compliance.forEach((co) => {
        activities.push({
          id: String(co.id),
          type: 'compliance',
          title: String(co.title),
          description: String(co.description || 'Compliance event flagged'),
          status: String(co.status),
          timestamp: new Date(co.created_at),
        });
      });
    }

    // Sort combined activities descending by timestamp and limit to 10
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  },
};
export default dashboardRepository;
