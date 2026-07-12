import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  type: z.enum(['csr_activity', 'challenge']),
  status: z.enum(['active', 'inactive']).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  type: z.enum(['csr_activity', 'challenge']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});
