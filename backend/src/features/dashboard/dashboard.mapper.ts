import { DepartmentRankingItem, RecentActivityItem } from './dashboard.types';

export const dashboardMapper = {
  /**
   * Maps raw department data to ranked frontend scores.
   */
  toDepartmentRanking(departments: any[]): DepartmentRankingItem[] {
    return departments.map((d) => ({
      departmentName: String(d.name || d.departmentName || 'Unknown Department'),
      environmentalScore: Number(d.environmentalScore ?? d.env_score ?? 0),
      socialScore: Number(d.socialScore ?? d.soc_score ?? 0),
      governanceScore: Number(d.governanceScore ?? d.gov_score ?? 0),
      overallScore: Number(d.overallScore ?? d.overall_score ?? 0),
    }));
  },

  /**
   * Maps raw activities to sanitized output objects.
   */
  toRecentActivities(activities: any[]): RecentActivityItem[] {
    return activities.map((a) => ({
      id: String(a.id),
      type: a.type,
      title: String(a.title),
      description: String(a.description),
      status: a.status ? String(a.status) : undefined,
      timestamp: new Date(a.timestamp),
    }));
  },
};
export default dashboardMapper;
