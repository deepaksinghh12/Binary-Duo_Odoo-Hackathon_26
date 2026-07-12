import db from '../../database/knex';
import { cacheGet, cacheSet } from '../../config/redis';

export class ReportsService {
  /**
   * Environmental Report
   */
  async getEnvironmentalReport(filters: any = {}) {
    const { department_id, start_date, end_date } = filters;
    const cacheKey = `report:env:${department_id || 'all'}:${start_date}:${end_date}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    let query = db('carbon_transactions').select('*');

    if (department_id) query = query.where('department_id', department_id);
    if (start_date) query = query.where('transaction_date', '>=', start_date);
    if (end_date) query = query.where('transaction_date', '<=', end_date);

    const transactions = await query;

    const totalCO2e = transactions.reduce((sum: any, t: any) => sum + Number(t.co2e_calculated || 0), 0);
    const byDepartment = await this.groupByDepartment(transactions);
    const byActivityType = await this.groupByActivityType(transactions);

    const result = {
      total_co2e: totalCO2e,
      transaction_count: transactions.length,
      by_department: byDepartment,
      by_activity_type: byActivityType,
      transactions,
    };

    await cacheSet(cacheKey, JSON.stringify(result), 600); // 10min cache
    return result;
  }

  /**
   * Social Report
   */
  async getSocialReport(filters: any = {}) {
    const { department_id, start_date, end_date } = filters;
    const cacheKey = `report:social:${department_id || 'all'}:${start_date}:${end_date}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    // CSR Activities
    let csrQuery = db('employee_participation')
      .join('users', 'employee_participation.employee_id', 'users.id')
      .select('employee_participation.*', 'users.department_id');

    if (department_id) csrQuery = csrQuery.where('users.department_id', department_id);
    if (start_date) csrQuery = csrQuery.where('employee_participation.created_at', '>=', start_date);
    if (end_date) csrQuery = csrQuery.where('employee_participation.created_at', '<=', end_date);

    const csrParticipation = await csrQuery;

    const approvedCount = csrParticipation.filter((p: any) => p.approval_status === 'approved').length;

    const result = {
      total_participation: csrParticipation.length,
      approved_count: approvedCount,
      participation_data: csrParticipation,
    };

    await cacheSet(cacheKey, JSON.stringify(result), 600);
    return result;
  }

  /**
   * Governance Report
   */
  async getGovernanceReport(filters: any = {}) {
    const { department_id, start_date, end_date } = filters;
    const cacheKey = `report:gov:${department_id || 'all'}:${start_date}:${end_date}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    // Compliance issues
    let issuesQuery = db('compliance_issues')
      .join('audits', 'compliance_issues.audit_id', 'audits.id')
      .select('compliance_issues.*', 'audits.department_id');

    if (department_id) issuesQuery = issuesQuery.where('audits.department_id', department_id);
    if (start_date) issuesQuery = issuesQuery.where('compliance_issues.created_at', '>=', start_date);
    if (end_date) issuesQuery = issuesQuery.where('compliance_issues.created_at', '<=', end_date);

    const issues = await issuesQuery;

    const resolvedCount = issues.filter((i: any) => i.status === 'resolved').length;
    const overdueCount = issues.filter(
      (i: any) => i.status === 'open' && new Date(i.due_date) < new Date()
    ).length;

    const result = {
      total_issues: issues.length,
      resolved_count: resolvedCount,
      overdue_count: overdueCount,
      issues,
    };

    await cacheSet(cacheKey, JSON.stringify(result), 600);
    return result;
  }

  /**
   * ESG Summary Report
   */
  async getESGSummaryReport(filters: any = {}) {
    const [env, social, gov] = await Promise.all([
      this.getEnvironmentalReport(filters),
      this.getSocialReport(filters),
      this.getGovernanceReport(filters),
    ]);

    return {
      environmental: env,
      social,
      governance: gov,
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Custom Report Builder
   */
  async generateCustomReport(filters: any = {}) {
    const { department_id, start_date, end_date, module, employee_id, challenge_id, esg_category } = filters;

    const result: any = {};

    if (!module || module === 'environmental') {
      result.environmental = await this.getEnvironmentalReport({ department_id, start_date, end_date });
    }

    if (!module || module === 'social') {
      result.social = await this.getSocialReport({ department_id, start_date, end_date });
    }

    if (!module || module === 'governance') {
      result.governance = await this.getGovernanceReport({ department_id, start_date, end_date });
    }

    return result;
  }

  private async groupByDepartment(transactions: any[]) {
    const grouped: any = {};
    for (const t of transactions) {
      const deptId = t.department_id || 'unknown';
      if (!grouped[deptId]) grouped[deptId] = { total: 0, count: 0 };
      grouped[deptId].total += Number(t.co2e_calculated || 0);
      grouped[deptId].count += 1;
    }
    return grouped;
  }

  private async groupByActivityType(transactions: any[]) {
    const grouped: any = {};
    for (const t of transactions) {
      const type = t.activity_type || 'unknown';
      if (!grouped[type]) grouped[type] = { total: 0, count: 0 };
      grouped[type].total += Number(t.co2e_calculated || 0);
      grouped[type].count += 1;
    }
    return grouped;
  }
}
