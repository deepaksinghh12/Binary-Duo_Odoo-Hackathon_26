export interface EmployeeParticipationRecord {
  id: string;
  employee_id: string;
  csr_activity_id: string;
  proof_url: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  points_earned: number;
  completion_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type CreateParticipationInput = {
  csr_activity_id: string;
  proof_url?: string | null;
};
