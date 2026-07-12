import { z } from 'zod';

export const createCarbonTransactionSchema = z.object({
  department_id: z.string().uuid(),
  activity_type: z.string().min(1),
  quantity: z.number().positive(),
  emission_factor_id: z.string().uuid(),
  source_type: z.enum(['purchase', 'manufacturing', 'expense', 'fleet', 'manual']).default('manual'),
  source_record_id: z.string().optional().nullable(),
  transaction_date: z.union([z.string(), z.date()]),
});
