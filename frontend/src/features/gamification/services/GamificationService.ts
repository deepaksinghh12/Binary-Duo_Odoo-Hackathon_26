import type { Challenge, ChallengeParticipation, Badge, Reward, LeaderboardEntry } from '../types';

// Mock Data
const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'chl-1',
    title: 'Sustainability Sprint',
    xp: 200,
    difficulty: 'Hard',
    deadline: '2026-07-20T00:00:00Z',
    status: 'Active',
  },
  {
    id: 'chl-2',
    title: 'Recycle Challenge',
    xp: 80,
    difficulty: 'Easy',
    deadline: '2026-07-15T00:00:00Z',
    status: 'Active',
  },
  {
    id: 'chl-3',
    title: 'Commute Green Week',
    xp: 120,
    difficulty: 'Medium',
    deadline: '2026-07-25T00:00:00Z',
    status: 'Draft',
  }
];

const MOCK_PARTICIPATION: ChallengeParticipation[] = [
  {
    id: 'part-1',
    challengeId: 'chl-1',
    challengeName: 'Sustainability Sprint',
    employeeName: 'Adili Rao',
    department: 'Manufacturing Dept',
    status: 'In Progress',
  },
  {
    id: 'part-2',
    challengeId: 'chl-2',
    challengeName: 'Recycle Challenge',
    employeeName: 'Jane Smith',
    department: 'Corporate Dept',
    status: 'Completed',
    completionDate: '2026-07-10T00:00:00Z',
  }
];

const MOCK_BADGES: Badge[] = [
  {
    id: 'bdg-1',
    name: 'Green Beginner',
    description: 'Awarded for completing the first sustainability challenge.',
    icon: 'MdEco',
    color: 'emerald',
    awardedCount: 145,
  },
  {
    id: 'bdg-2',
    name: 'Carbon Saver',
    description: 'Saved over 100kg of CO2 emissions.',
    icon: 'MdNature',
    color: 'green',
    awardedCount: 89,
  },
  {
    id: 'bdg-3',
    name: 'Sustainability Champion',
    description: 'Top contributor in the department for the quarter.',
    icon: 'MdPublic',
    color: 'blue',
    awardedCount: 12,
  },
  {
    id: 'bdg-4',
    name: 'Team Player',
    description: 'Participated in 5 group environmental initiatives.',
    icon: 'MdStar',
    color: 'emerald',
    awardedCount: 230,
  }
];

const MOCK_REWARDS: Reward[] = [
  {
    id: 'rwd-1',
    name: 'Eco-Friendly Water Bottle',
    description: 'Stainless steel, reusable water bottle with company logo.',
    costXP: 500,
    status: 'Available',
  },
  {
    id: 'rwd-2',
    name: 'Extra Vacation Day',
    description: 'One additional day of paid time off.',
    costXP: 5000,
    status: 'Available',
  },
  {
    id: 'rwd-3',
    name: 'Organic Coffee Beans',
    description: '1 lb of premium, fair-trade organic coffee.',
    costXP: 800,
    status: 'Out of Stock',
  }
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'ldr-1',
    rank: 1,
    employeeName: 'Manufacturing Dept',
    department: 'Department', // Grouped entry as seen in wireframe
    totalXP: 4820,
    level: 15,
  },
  {
    id: 'ldr-2',
    rank: 2,
    employeeName: 'Adili Rao',
    department: 'Manufacturing',
    totalXP: 3910,
    level: 12,
  },
  {
    id: 'ldr-3',
    rank: 3,
    employeeName: 'Corporate Dept',
    department: 'Department',
    totalXP: 3505,
    level: 10,
  },
  {
    id: 'ldr-4',
    rank: 4,
    employeeName: 'Jane Smith',
    department: 'Corporate',
    totalXP: 3200,
    level: 9,
  }
];

export class GamificationService {
  static async getChallenges(): Promise<Challenge[]> {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_CHALLENGES]), 600));
  }

  static async getParticipation(): Promise<ChallengeParticipation[]> {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_PARTICIPATION]), 400));
  }

  static async getBadges(): Promise<Badge[]> {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_BADGES]), 500));
  }

  static async getRewards(): Promise<Reward[]> {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_REWARDS]), 500));
  }

  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_LEADERBOARD]), 500));
  }
}
