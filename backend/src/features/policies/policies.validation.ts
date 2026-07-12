import { z } from 'zod';

export const createPolicySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  url: z.string().url('Must be a valid URL').optional().nullable(),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
  department_id: z.string().uuid('Invalid department ID').optional().nullable(),
});

export const updatePolicySchema = createPolicySchema.partial();
