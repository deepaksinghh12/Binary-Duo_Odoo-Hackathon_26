export interface CsrActivityRecord {
  id: string;
  title: string;
  category_id: string;
  description: string | null;
  department_id: string;
  date: Date;
  status: 'active' | 'inactive' | 'completed';
  points_value: number;
  evidence_required: boolean | null;
  joined_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type CreateCsrActivityInput = Omit<
  CsrActivityRecord,
  'id' | 'joined_count' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type UpdateCsrActivityInput = Partial<CreateCsrActivityInput>;
