export interface ComplianceRecord {
  id: string;
  entity_type: string;
  entity_id: string;
  policy_id: string;
  compliance_status: 'compliant' | 'non-compliant' | 'pending';
  last_checked: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type CreateComplianceRecordInput = Omit<ComplianceRecord, 'id' | 'created_at' | 'updated_at'>;

export type UpdateComplianceRecordInput = Partial<CreateComplianceRecordInput>;
