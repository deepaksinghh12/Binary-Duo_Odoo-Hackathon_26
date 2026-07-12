import { z } from 'zod';

export const createCsrActivitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category_id: z.string().uuid('Invalid category ID'),
  description: z.string().optional().nullable(),
  department_id: z.string().uuid('Invalid department ID'),
  date: z.union([z.string(), z.date()]),
  status: z.enum(['active', 'inactive', 'completed']).default('active'),
  points_value: z.number().int().min(0).default(0),
  evidence_required: z.boolean().optional().nullable(),
});

export const updateCsrActivitySchema = createCsrActivitySchema.partial();
