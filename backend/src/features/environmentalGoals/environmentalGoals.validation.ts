import { z } from 'zod';

export const createEnvironmentalGoalSchema = z.object({
  department_id: z.string().uuid('Invalid department ID'),
  target_metric: z.string().min(2, 'Target metric must be at least 2 characters').max(100),
  target_value: z.coerce.number().positive('Target value must be greater than zero'),
  target_date: z.coerce.date().refine((val) => val > new Date(), {
    message: 'Target date must be in the future',
  }),
  current_progress: z.coerce.number().min(0, 'Current progress cannot be negative').optional(),
  status: z.enum(['active', 'achieved', 'failed']).optional(),
});

export const updateEnvironmentalGoalSchema = createEnvironmentalGoalSchema.partial();
