import { z } from 'zod';

export const createEmissionFactorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  activity_type: z.string().min(1, 'Activity type is required').max(100),
  unit: z.string().min(1, 'Unit is required').max(50),
  co2e_factor: z.coerce.number().positive('CO2e factor must be greater than zero'),
  source: z.string().max(200).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const updateEmissionFactorSchema = createEmissionFactorSchema.partial();
