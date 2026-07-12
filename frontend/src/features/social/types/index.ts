export interface CSRActivity {
  id: string;
  title: string;
  icon: string; // We'll map string to an icon component
  participantsCount: number;
  status: 'open' | 'evidence_required' | 'closed';
  color: string; // for the icon
}

export interface EmployeeParticipation {
  id: string;
  employeeName: string;
  activityChallenge: string;
  proof: string;
  points: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export interface DiversityMetric {
  id: string;
  category: string; // e.g., 'Gender', 'Age', 'Ethnicity'
  value: number; // percentage
  label: string; 
  trend: 'up' | 'down' | 'flat';
}
