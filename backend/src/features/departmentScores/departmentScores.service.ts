import db from '../../database/knex';
import { cacheGet, cacheSet, cacheDelPattern } from '../../config/redis';

export class DepartmentScoresService {
  /**
   * Calculate and return department scores
   * Environmental: carbon transactions vs goals
   * Social: CSR participation rate, training completion
   * Governance: policy acknowledgement rate, compliance resolution
   */
  async calculateDepartmentScores(departmentId?: string) {
    const cacheKey = `department-scores:${departmentId || 'all'}`;

    // Try cache first (10 minute TTL)
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    let departments: any[] = [];

    if (departmentId) {
      const dept = await db('departments').where({ id: departmentId, deleted_at: null }).first();
      if (dept) departments = [dept];
    } else {
      departments = await db('departments').where('deleted_at', null).select('*');
    }

    const scores = await Promise.all(
      departments.map(async (dept) => {
        const envScore = await this.calculateEnvironmentalScore(dept.id);
        const socialScore = await this.calculateSocialScore(dept.id);
        const govScore = await this.calculateGovernanceScore(dept.id);

        // Get ESG weights from settings
        const weights = await this.getESGWeights();
        
        const totalScore =
          (envScore * weights.environmental +
            socialScore * weights.social +
            govScore * weights.governance) /
          100;

        // Get department total XP
        const xpResult = await db('users')
          .where({ department_id: dept.id })
          .sum('xp_total as total')
          .first();
        const totalXp = Number(xpResult?.total || 0);

        // Store in department_scores table
        await db('department_scores')
          .insert({
            department_id: dept.id,
            environmental_score: envScore,
            social_score: socialScore,
            governance_score: govScore,
            total_score: totalScore,
            total_xp: totalXp,
            calculated_at: db.fn.now(),
          })
          .onConflict(['department_id'])
          .merge();

        return {
          department_id: dept.id,
          department_name: dept.name,
          environmental_score: envScore,
          social_score: socialScore,
          governance_score: govScore,
          total_score: totalScore,
          total_xp: totalXp,
          rank: 0, // Will be set after sorting
        };
      })
    );

    // Sort by total score and assign ranks
    scores.sort((a, b) => b.total_score - a.total_score);
    scores.forEach((score, index) => {
      score.rank = index + 1;
    });

    // Cache for 10 minutes (600 seconds)
    await cacheSet(cacheKey, JSON.stringify(scores), 600);

    return scores;
  }

  /**
   * Calculate Environmental Score (0-100)
   * Based on: carbon reduction vs goals, carbon transactions trend
   */
  private async calculateEnvironmentalScore(departmentId: string): Promise<number> {
    // Get department's environmental goals
    const goals = await db('environmental_goals')
      .where({ department_id: departmentId, deleted_at: null })
      .select('*');

    if (goals.length === 0) return 50; // Default if no goals set

    let totalProgress = 0;
    for (const goal of goals) {
      // Calculate current CO2 for this goal's timeframe
      const currentCO2 = await db('carbon_transactions')
        .where('department_id', departmentId)
        .where('transaction_date', '>=', goal.created_at)
        .sum('co2e_calculated as total')
        .first();

      const current = Number(currentCO2?.total || 0);
      const target = goal.target_value;

      // Progress: lower is better for CO2 reduction
      const progress = target > 0 ? Math.max(0, Math.min(100, ((target - current) / target) * 100)) : 50;
      totalProgress += progress;
    }

    return Math.round(totalProgress / goals.length);
  }

  /**
   * Calculate Social Score (0-100)
   * Based on: CSR participation rate, employee engagement
   */
  private async calculateSocialScore(departmentId: string): Promise<number> {
    const employeeCount = await db('users')
      .where({ department_id: departmentId, is_active: true })
      .count('id as count')
      .first();

    const empCount = Number(employeeCount?.count || 0);
    if (empCount === 0) return 0;

    // CSR participation rate
    const participationCount = await db('employee_participation')
      .join('users', 'employee_participation.employee_id', 'users.id')
      .where('users.department_id', departmentId)
      .where('employee_participation.approval_status', 'approved')
      .count('employee_participation.id as count')
      .first();

    const partCount = Number(participationCount?.count || 0);
    const participationScore = Math.min(100, (partCount / empCount) * 20); // 5 activities per person = 100%

    // Challenge participation
    const challengeCount = await db('challenge_participation')
      .join('users', 'challenge_participation.employee_id', 'users.id')
      .where('users.department_id', departmentId)
      .where('challenge_participation.approval_status', 'approved')
      .count('challenge_participation.id as count')
      .first();

    const challCount = Number(challengeCount?.count || 0);
    const challengeScore = Math.min(100, (challCount / empCount) * 25); // 4 challenges per person = 100%

    return Math.round((participationScore + challengeScore) / 2);
  }

  /**
   * Calculate Governance Score (0-100)
   * Based on: policy acknowledgement rate, compliance issue resolution
   */
  private async calculateGovernanceScore(departmentId: string): Promise<number> {
    const employeeCount = await db('users')
      .where({ department_id: departmentId, is_active: true })
      .count('id as count')
      .first();

    const empCount = Number(employeeCount?.count || 0);
    if (empCount === 0) return 0;

    // Policy acknowledgement rate
    const totalPolicies = await db('policies').where('deleted_at', null).count('id as count').first();
    const policyCount = Number(totalPolicies?.count || 1);

    const acknowledgedCount = await db('policy_acknowledgements')
      .join('users', 'policy_acknowledgements.employee_id', 'users.id')
      .where('users.department_id', departmentId)
      .count('policy_acknowledgements.id as count')
      .first();

    const ackCount = Number(acknowledgedCount?.count || 0);
    const acknowledgementScore = Math.min(100, (ackCount / (empCount * policyCount)) * 100);

    // Compliance issue resolution rate
    const totalIssues = await db('compliance_issues')
      .join('audits', 'compliance_issues.audit_id', 'audits.id')
      .where('audits.department_id', departmentId)
      .count('compliance_issues.id as count')
      .first();

    const resolvedIssues = await db('compliance_issues')
      .join('audits', 'compliance_issues.audit_id', 'audits.id')
      .where('audits.department_id', departmentId)
      .where('compliance_issues.status', 'resolved')
      .count('compliance_issues.id as count')
      .first();

    const totalCount = Number(totalIssues?.count || 0);
    const resolvedCount = Number(resolvedIssues?.count || 0);

    const resolutionScore = totalCount > 0 ? (resolvedCount / totalCount) * 100 : 100;

    return Math.round((acknowledgementScore * 0.6 + resolutionScore * 0.4));
  }

  /**
   * Get ESG weights from settings (Environmental, Social, Governance percentages)
   */
  private async getESGWeights(): Promise<{
    environmental: number;
    social: number;
    governance: number;
  }> {
    const setting = await db('settings').where({ key: 'esg_weights' }).first();

    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        return {
          environmental: parsed.environmental || 40,
          social: parsed.social || 30,
          governance: parsed.governance || 30,
        };
      } catch (e) {
        // Fallback to defaults
      }
    }

    // Default weights: E=40%, S=30%, G=30%
    return { environmental: 40, social: 30, governance: 30 };
  }

  /**
   * Invalidate department scores cache
   */
  async invalidateCache() {
    await cacheDelPattern('department-scores:*');
  }
}
