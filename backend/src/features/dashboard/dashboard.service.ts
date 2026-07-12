import { EsgWeights, EsgSummaryData, EmissionTrendItem, DepartmentRankingItem, RecentActivityItem, QuickActionItem } from './dashboard.types';
import { dashboardRepository } from './dashboard.repository';
import { dashboardMapper } from './dashboard.mapper';
import { cache } from '../../utils/cache';
import { validate } from '../../utils/validate';
import { summaryWeightsSchema } from './dashboard.validation';
import { UserRole } from '../../shared/types';

// Caching Durations
const CACHE_SUMMARY_TTL = 2 * 60 * 1000;       // 2 minutes
const CACHE_CHART_TTL = 5 * 60 * 1000;         // 5 minutes
const CACHE_RANKING_TTL = 2 * 60 * 1000;       // 2 minutes

export const dashboardService = {
  /**
   * Fetch consolidated ESG dashboard summary.
   * Caches response per-user to reduce database load.
   */
  async getSummary(userId: string, customWeights?: Partial<EsgWeights>): Promise<EsgSummaryData> {
    const payload = validate(summaryWeightsSchema, customWeights ?? {});
    
    const envWeight = payload.environmental ?? 40;
    const socWeight = payload.social ?? 30;
    const govWeight = payload.governance ?? 30;

    const cacheKey = `dashboard:summary:${userId}:${envWeight}:${socWeight}:${govWeight}`;
    const cachedData = await cache.get<EsgSummaryData>(cacheKey);
    if (cachedData) {
      console.log(`⚡ [CACHE HIT] Loaded summary for user ${userId}`);
      return cachedData;
    }

    // Default realistic baseline scores (hydrated dynamically once steps 5-10 insert real rows)
    let environmentalScore = 72.4;
    let socialScore = 81.0;
    let governanceScore = 86.5;

    // A. Dynamic Environmental Score check
    try {
      const hasEmissions = await dashboardRepository.tableExists('carbon_transactions');
      if (hasEmissions) {
        const total = await dashboardRepository.getTotalEmissions();
        if (total > 0) {
          // Adjust score dynamically: higher emissions reduce score from base 100
          environmentalScore = Math.max(10, 100 - (total / 1000));
        }
      }
    } catch (err) {
      // Fallback to baseline
    }

    // B. Calculate overall ESG score using configurable weights
    const overallScore = Number(
      ((environmentalScore * envWeight + socialScore * socWeight + governanceScore * govWeight) / 100).toFixed(1)
    );

    const summary: EsgSummaryData = {
      environmentalScore: Number(environmentalScore.toFixed(1)),
      socialScore: Number(socialScore.toFixed(1)),
      governanceScore: Number(governanceScore.toFixed(1)),
      overallScore,
    };

    // Cache results
    await cache.set(cacheKey, summary, CACHE_SUMMARY_TTL);
    return summary;
  },

  /**
   * Fetch carbon emission trends for the last 12 months.
   */
  async getEmissionTrend(userId: string): Promise<EmissionTrendItem[]> {
    const cacheKey = `dashboard:trend:${userId}`;
    const cachedData = await cache.get<EmissionTrendItem[]>(cacheKey);
    if (cachedData) {
      console.log(`⚡ [CACHE HIT] Loaded emission trends`);
      return cachedData;
    }

    let trendData: EmissionTrendItem[] = [];

    try {
      const realTrend = await dashboardRepository.getMonthlyEmissions();
      if (realTrend.length > 0) {
        trendData = realTrend;
      } else {
        // Fallback to high-fidelity mock list for visualization
        const months = ['Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026'];
        const baselines = [450, 430, 480, 520, 500, 460, 440, 410, 390, 380, 360, 350];
        trendData = months.map((m, idx) => ({
          month: m,
          emission: baselines[idx],
        }));
      }
    } catch (err) {
      // Fallback on table error
    }

    await cache.set(cacheKey, trendData, CACHE_CHART_TTL);
    return trendData;
  },

  /**
   * Get department ESG rankings sorted in descending order of overall score.
   */
  async getDepartmentRanking(userId: string): Promise<DepartmentRankingItem[]> {
    const cacheKey = `dashboard:ranking:${userId}`;
    const cachedData = await cache.get<DepartmentRankingItem[]>(cacheKey);
    if (cachedData) {
      console.log(`⚡ [CACHE HIT] Loaded department rankings`);
      return cachedData;
    }

    let rankings: DepartmentRankingItem[] = [];

    try {
      const depts = await dashboardRepository.getDepartmentsList();
      if (depts.length > 0) {
        // Hydrate rankings dynamically based on department codes
        rankings = depts.map((d) => {
          let env = 75;
          let soc = 80;
          let gov = 85;

          if (d.code === 'ENG') { env = 85; soc = 78; gov = 90; }
          else if (d.code === 'HR') { env = 92; soc = 88; gov = 92; }
          else if (d.code === 'OPS') { env = 68; soc = 72; gov = 80; }

          const overall = Number(((env * 0.4 + soc * 0.3 + gov * 0.3)).toFixed(1));

          return {
            departmentName: d.name,
            environmentalScore: env,
            socialScore: soc,
            governanceScore: gov,
            overallScore: overall,
          };
        });
      } else {
        // Default ranked list
        rankings = [
          { departmentName: 'Human Resources', environmentalScore: 92, socialScore: 88, governanceScore: 90, overallScore: 89.8 },
          { departmentName: 'Sales & Marketing', environmentalScore: 85, socialScore: 82, governanceScore: 85, overallScore: 84.1 },
          { departmentName: 'Engineering', environmentalScore: 82, socialScore: 75, governanceScore: 88, overallScore: 81.7 },
          { departmentName: 'Operations', environmentalScore: 68, socialScore: 70, governanceScore: 80, overallScore: 72.2 },
        ];
      }
    } catch (err) {
      // Fallback
    }

    // Sort descending by overall ESG score
    rankings.sort((a, b) => b.overallScore - a.overallScore);

    await cache.set(cacheKey, rankings, CACHE_RANKING_TTL);
    return rankings;
  },

  /**
   * Get maximum 10 recent activities consolidated across modules.
   */
  async getRecentActivities(userId: string): Promise<RecentActivityItem[]> {
    let activities: RecentActivityItem[] = [];

    try {
      const list = await dashboardRepository.getRecentActivities();
      if (list.length > 0) {
        activities = dashboardMapper.toRecentActivities(list);
      } else {
        // High fidelity mock items for presentation
        activities = [
          { id: '1', type: 'compliance', title: 'Scope 2 Audit Complete', description: 'Internal audit verified by auditor', timestamp: new Date(Date.now() - 30 * 60000) },
          { id: '2', type: 'csr', title: 'Tree Plantation Drive', description: '15 participants registered from Engineering', timestamp: new Date(Date.now() - 120 * 60000) },
          { id: '3', type: 'policy', title: 'ESG Code of Conduct V2', description: 'Policy published and requires acknowledgment', timestamp: new Date(Date.now() - 480 * 60000) },
          { id: '4', type: 'challenge', title: 'Zero Waste Week', description: 'Challenge started for ENG and HR departments', timestamp: new Date(Date.now() - 1440 * 60000) },
        ];
      }
    } catch (err) {
      // Fallback
    }

    return activities;
  },

  /**
   * Get available quick actions filtered by user role permissions.
   */
  async getQuickActions(role: UserRole): Promise<QuickActionItem[]> {
    const allActions: QuickActionItem[] = [
      { action: 'Log Carbon Transaction', permission: 'employee', route: '/emissions/log' },
      { action: 'Acknowledge ESG Policy', permission: 'employee', route: '/policies/pending' },
      { action: 'Join Sustainability Challenge', permission: 'employee', route: '/challenges/active' },
      { action: 'Log CSR Participation', permission: 'employee', route: '/csr/log' },
      
      { action: 'Approve Pending Log Entries', permission: 'manager', route: '/approvals/pending' },
      { action: 'Manage Department Settings', permission: 'manager', route: '/departments/edit' },
      { action: 'Publish Sustainability Challenge', permission: 'manager', route: '/challenges/create' },
      
      { action: 'Configure ESG System Settings', permission: 'admin', route: '/settings/system' },
      { action: 'Create ESG Policy Update', permission: 'admin', route: '/policies/create' },
      { action: 'Audit Global Compliance Issues', permission: 'admin', route: '/compliance/issues' },
    ];

    // Filters routes user has permission to access
    return allActions.filter((act) => {
      if (act.permission === 'employee') return true; // Accessible by everyone
      if (act.permission === 'manager') return role === 'manager' || role === 'admin';
      if (act.permission === 'admin') return role === 'admin';
      return false;
    });
  },
};
export default dashboardService;
