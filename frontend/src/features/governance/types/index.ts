export interface Policy {
  id: string;
  title: string;
  description: string;
  department: string;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
  version: string;
  icon?: string;
  color?: string;
}

export interface PolicyAcknowledgement {
  id: string;
  employeeName: string;
  policyTitle: string;
  department: string;
  date: string;
  status: 'acknowledged' | 'pending' | 'overdue';
}

export interface Audit {
  id: string;
  title: string;
  department: string;
  auditor: string;
  date: string;
  findings: string;
  status: 'Completed' | 'Under Review' | 'Scheduled' | 'In Progress';
}

export interface ComplianceIssue {
  id: string;
  issue: string;
  severity: 'High' | 'Medium' | 'Low';
  department: string;
  status: 'Open' | 'Resolved' | 'In Progress';
}
