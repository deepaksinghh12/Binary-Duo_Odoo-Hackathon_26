export type ComplianceSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceIssueStatus = 'open' | 'in_progress' | 'resolved';

export interface ComplianceIssue {
  id: string;
  audit_id: string;
  severity: ComplianceSeverity;
  description: string;
  owner_id: string;
  due_date: Date;
  status: ComplianceIssueStatus;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields (optional — present in list queries)
  owner_name?: string;
  department_id?: string;
  department_name?: string;
}

export interface CreateComplianceIssueDto {
  audit_id: string;
  severity: ComplianceSeverity;
  description: string;
  owner_id: string;
  due_date: string; // ISO date string from request
  status?: ComplianceIssueStatus;
}

export interface UpdateComplianceIssueDto {
  severity?: ComplianceSeverity;
  description?: string;
  owner_id?: string;
  due_date?: string;
  status?: ComplianceIssueStatus;
}

export interface ComplianceIssueFilters {
  page?: number;
  limit?: number;
  audit_id?: string;
  department_id?: string;
  severity?: ComplianceSeverity;
  status?: ComplianceIssueStatus;
  owner_id?: string;
}
