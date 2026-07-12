export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ChallengeStatus = 'Draft' | 'Active' | 'Under Review' | 'Completed' | 'Archived';

export interface Challenge {
  id: string;
  title: string;
  xp: number;
  difficulty: ChallengeDifficulty;
  deadline: string; // ISO Date String
  status: ChallengeStatus;
  description?: string;
}

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  challengeName: string;
  employeeName: string;
  department: string;
  status: 'Joined' | 'In Progress' | 'Completed';
  completionDate?: string; // ISO Date String
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Icon identifier (e.g., 'GreenBeginner')
  color: string; // Hex or tailwind class
  awardedCount?: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  costXP: number;
  status: 'Available' | 'Out of Stock' | 'Redeemed';
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  employeeName: string;
  department: string;
  totalXP: number;
  level: number;
}
