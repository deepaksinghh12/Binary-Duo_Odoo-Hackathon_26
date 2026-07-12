import { z } from 'zod';

export const createParticipationSchema = z.object({
  challenge_id: z.string().uuid('Invalid challenge ID'),
  proof_url: z.string().url('Invalid proof URL').optional(),
  progress: z.number().int().min(0).max(100).optional(),
});

export const updateParticipationSchema = z.object({
  progress: z.number().int().min(0).max(100).optional(),
  proof_url: z.string().url('Invalid proof URL').optional(),
});

export const approvalActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

export const participationFiltersSchema = z.object({
  challenge_id: z.string().uuid().optional(),
  employee_id: z.string().uuid().optional(),
  approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
