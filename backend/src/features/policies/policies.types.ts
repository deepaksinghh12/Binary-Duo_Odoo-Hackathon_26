export interface PolicyRecord {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  status: 'active' | 'inactive' | 'draft';
  department_id: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type CreatePolicyInput = Omit<PolicyRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

export type UpdatePolicyInput = Partial<CreatePolicyInput>;
