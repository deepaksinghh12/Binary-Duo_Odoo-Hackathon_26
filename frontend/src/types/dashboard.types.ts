export interface SummaryResponse {
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
}

export interface EmissionTrendResponse {
  month: string;
  emission: number;
}

export interface DepartmentRankingResponse {
  departmentName: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
}

export interface RecentActivityResponse {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface QuickActionResponse {
  action: string;
  permission: string;
  route: string;
}

// Mapped types for UI Components
export interface ESGScore {
  environmental: number;
  social: number;
  governance: number;
  overall: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface EmissionData {
  month: string;
  emissions: number;
}

export interface DepartmentRanking {
  department: string;
  score: number;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardSummary {
  scores: ESGScore;
  emissions: EmissionData[];
  rankings: DepartmentRanking[];
  activities: Activity[];
}
