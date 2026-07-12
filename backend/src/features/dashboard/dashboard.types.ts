export interface EsgScoreWeights {
  environmental: number; // default 40
  social: number;        // default 30
  governance: number;    // default 30
}

export interface DashboardSummaryData {
  metrics: {
    totalCo2e: number;
    socialScore: number;
    governanceRating: number;
    companiesCount: number;
    departmentsCount: number;
    compliancePendingIssues: number;
  };
  environmental: {
    totalEmissionsByScope: {
      scope1: number;
      scope2: number;
      scope3: number;
    };
    targetProgressPercentage: number;
  };
  social: {
    csrParticipationCount: number;
    activeParticipantsCount: number;
    pointsAwarded: number;
  };
  governance: {
    policyAcknowledgementRate: number; // e.g. 85.5 (%)
    auditsCompletedCount: number;
    activeComplianceIssuesCount: number;
  };
  departmentBreakdown: Array<{
    departmentName: string;
    departmentCode: string;
    scores: {
      environmental: number;
      social: number;
      governance: number;
      total: number;
    };
  }>;
}
