export type ParticipationApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ChallengeParticipation {
  id: string;
  challenge_id: string;
  employee_id: string;
  progress: number;
  proof_url: string | null;
  approval_status: ParticipationApprovalStatus;
  xp_awarded: number;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateParticipationDto {
  challenge_id: string;
  employee_id: string;
  progress?: number;
  proof_url?: string;
}

export interface UpdateParticipationDto {
  progress?: number;
  proof_url?: string;
}

export interface ParticipationFilters {
  challenge_id?: string;
  employee_id?: string;
  approval_status?: ParticipationApprovalStatus;
  page?: number;
  limit?: number;
}
