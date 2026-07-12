import { z } from 'zod';

export const createParticipationSchema = z.object({
  csr_activity_id: z.string().uuid('Invalid activity ID'),
  proof_url: z.string().url('Must be a valid URL').optional().nullable(),
});
