import { z } from 'zod';

export const createAuditSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  auditor_id: z.string().uuid('Invalid auditor ID'),
  date: z.union([z.string(), z.date()]),
  status: z.enum(['planned', 'ongoing', 'completed']).default('planned'),
  findings: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
});

export const updateAuditSchema = createAuditSchema.partial();
