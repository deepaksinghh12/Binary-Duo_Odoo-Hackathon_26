import { z } from 'zod';

export const createProductEsgProfileSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  category_id: z.string().uuid('Invalid category ID'),
  emission_factor_id: z.string().uuid('Invalid emission factor ID'),
  notes: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateProductEsgProfileSchema = createProductEsgProfileSchema.partial();
