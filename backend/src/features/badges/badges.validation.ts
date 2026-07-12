import { z } from 'zod';

const unlockRuleSchema = z.object({
  metric: z.enum(['xp', 'completedChallenges']),
  operator: z.enum(['>=', '>']),
  value: z.number().int().min(0),
});

export const createBadgeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  unlock_rule: unlockRuleSchema,
  icon: z.string().url('Icon must be a valid URL').optional().nullable(),
});

export const updateBadgeSchema = createBadgeSchema.partial();
