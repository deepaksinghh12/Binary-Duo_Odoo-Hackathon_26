export type ChallengeStatus = 'draft' | 'active' | 'under_review' | 'completed' | 'archived';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export interface Challenge {
  id: string;
  title: string;
  category_id: string;
  description: string;
  xp_reward: number;
  difficulty: ChallengeDifficulty;
  evidence_required: boolean;
  deadline: Date | null;
  status: ChallengeStatus;
  participant_count: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateChallengeDto {
  title: string;
  category_id: string;
  description: string;
  xp_reward: number;
  difficulty: ChallengeDifficulty;
  evidence_required: boolean;
  deadline?: Date;
  status?: ChallengeStatus;
}

export interface UpdateChallengeDto {
  title?: string;
  category_id?: string;
  description?: string;
  xp_reward?: number;
  difficulty?: ChallengeDifficulty;
  evidence_required?: boolean;
  deadline?: Date;
  status?: ChallengeStatus;
}

export interface ChallengeFilters {
  status?: ChallengeStatus;
  difficulty?: ChallengeDifficulty;
  category_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Valid status transitions map
export const VALID_STATUS_TRANSITIONS: Record<ChallengeStatus, ChallengeStatus[]> = {
  draft: ['active', 'archived'],
  active: ['under_review', 'archived'],
  under_review: ['completed', 'archived'],
  completed: ['archived'],
  archived: [], // Cannot transition from archived
};

export function isValidStatusTransition(from: ChallengeStatus, to: ChallengeStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) || false;
}
