export interface BadgeUnlockRule {
  metric: 'xp' | 'completedChallenges';
  operator: '>=' | '>';
  value: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlock_rule: BadgeUnlockRule;
  icon: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBadgeDto {
  name: string;
  description: string;
  unlock_rule: BadgeUnlockRule;
  icon?: string;
}

export interface UpdateBadgeDto {
  name?: string;
  description?: string;
  unlock_rule?: BadgeUnlockRule;
  icon?: string;
}
