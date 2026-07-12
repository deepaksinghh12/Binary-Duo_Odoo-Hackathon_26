import db from '../../database/knex';
import { cacheGet, cacheSet } from '../../config/redis';

export class LeaderboardService {
  /**
   * Get combined leaderboard (individuals + departments ranked together)
   * Per Backend Alignment Addendum requirement
   */
  async getCombinedLeaderboard(filters: {
    department_id?: string;
    period?: string;
    limit?: number;
  } = {}) {
    const { department_id, period, limit = 50 } = filters;

    const cacheKey = `leaderboard:combined:${department_id || 'all'}:${period || 'all'}:${limit}`;
    
    // Try cache first (5 minute TTL)
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get individual rankings
    let individualsQuery = db('users')
      .where('is_active', true)
      .select('id', 'name', 'xp_total', 'department_id')
      .orderBy('xp_total', 'desc');

    if (department_id) {
      individualsQuery = individualsQuery.where('department_id', department_id);
    }

    const individuals = await individualsQuery.limit(limit);

    // Get department rankings (sum of all employees' XP)
    let departmentsQuery = db('departments')
      .leftJoin('users', 'departments.id', 'users.department_id')
      .where('departments.deleted_at', null)
      .groupBy('departments.id', 'departments.name')
      .select(
        'departments.id',
        'departments.name',
        db.raw('COALESCE(SUM(users.xp_total), 0) as total_xp')
      )
      .orderBy('total_xp', 'desc');

    const departments = await departmentsQuery.limit(limit);

    // Combine and re-sort by XP
    const combined = [
      ...individuals.map((i: any) => ({
        id: i.id,
        name: i.name,
        xp: i.xp_total,
        scope: 'individual' as const,
        department_id: i.department_id,
      })),
      ...departments.map((d: any) => ({
        id: d.id,
        name: d.name,
        xp: Number(d.total_xp),
        scope: 'department' as const,
      })),
    ];

    // Sort combined list by XP descending and add ranks
    combined.sort((a, b) => b.xp - a.xp);
    const rankedLeaderboard = combined.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Cache for 5 minutes (300 seconds)
    await cacheSet(cacheKey, JSON.stringify(rankedLeaderboard), 300);

    return rankedLeaderboard;
  }

  /**
   * Get individual-only leaderboard (legacy endpoint if needed)
   */
  async getIndividualLeaderboard(filters: any = {}) {
    const { department_id, page = 1, limit = 20 } = filters;

    let query = db('users')
      .where('is_active', true)
      .select('id', 'name', 'email', 'xp_total', 'completed_challenges_count', 'department_id')
      .orderBy('xp_total', 'desc');

    if (department_id) {
      query = query.where('department_id', department_id);
    }

    const total = await query.clone().count('id as count').first().then((r: any) => Number(r?.count || 0));
    const data = await query.limit(limit).offset((page - 1) * limit);

    // Add rank
    const rankedData = data.map((user: any, index: number) => ({
      ...user,
      rank: (page - 1) * limit + index + 1,
    }));

    return { data: rankedData, total };
  }
}
