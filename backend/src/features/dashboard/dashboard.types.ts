export interface EsgWeights {
  environmental: number;
  social: number;
  governance: number;
}

export interface EsgSummaryData {
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
}

export interface EmissionTrendItem {
  month: string; // e.g. "Jul 2026"
  emission: number;
}

export interface DepartmentRankingItem {
  departmentName: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'carbon_transaction' | 'challenge' | 'csr' | 'policy' | 'compliance';
  title: string;
  description: string;
  status?: string;
  timestamp: Date;
}

export interface QuickActionItem {
  action: string;
  permission: string; // 'admin' | 'manager' | 'employee' | 'all'
  route: string;
}
