export interface AuditRecord {
  id: string;
  title: string;
  auditor_id: string;
  date: Date;
  status: 'planned' | 'ongoing' | 'completed';
  findings: string | null;
  resolution: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type CreateAuditInput = Omit<AuditRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

export type UpdateAuditInput = Partial<CreateAuditInput>;
