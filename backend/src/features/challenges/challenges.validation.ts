import { z } from 'zod';

export const createChallengeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  category_id: z.string().uuid('Invalid category ID'),
  description: z.string().min(1, 'Description is required'),
  xp_reward: z.number().int().min(0, 'XP reward must be non-negative'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  evidence_required: z.boolean(),
  deadline: z.union([z.string().datetime(), z.date()]).optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(['draft', 'active', 'under_review', 'completed', 'archived']).optional(),
});

export const updateChallengeSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  category_id: z.string().uuid().optional(),
  description: z.string().min(1).optional(),
  xp_reward: z.number().int().min(0).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  evidence_required: z.boolean().optional(),
  deadline: z.union([z.string().datetime(), z.date()]).nullable().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(['draft', 'active', 'under_review', 'completed', 'archived']).optional(),
});

export const updateChallengeStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'under_review', 'completed', 'archived']),
});

export const challengeFiltersSchema = z.object({
  status: z.enum(['draft', 'active', 'under_review', 'completed', 'archived']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  category_id: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
