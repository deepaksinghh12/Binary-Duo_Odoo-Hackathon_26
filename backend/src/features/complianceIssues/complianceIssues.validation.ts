import { z } from 'zod';

export const createComplianceIssueSchema = z.object({
  audit_id: z.string().uuid('Invalid audit ID'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(1, 'Description is required'),
  // owner_id required — cannot create an issue without an owner (spec Step 7)
  owner_id: z.string().uuid('Invalid owner ID'),
  // due_date required — cannot create an issue without a deadline (spec Step 7)
  due_date: z.string().refine((v) => !isNaN(Date.parse(v)), { message: 'due_date must be a valid date' }),
  status: z.enum(['open', 'in_progress', 'resolved']).optional().default('open'),
});

export const updateComplianceIssueSchema = createComplianceIssueSchema.partial().omit({ audit_id: true });

export const complianceIssueFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  audit_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved']).optional(),
  owner_id: z.string().uuid().optional(),
});
