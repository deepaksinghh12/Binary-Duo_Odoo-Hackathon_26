import { z } from 'zod';

export const summaryWeightsSchema = z.object({
  environmental: z.coerce.number().min(0).max(100).optional(),
  social: z.coerce.number().min(0).max(100).optional(),
  governance: z.coerce.number().min(0).max(100).optional(),
}).refine(
  (data) => {
    // If any weight is customized, check that they sum up to 100
    const env = data.environmental ?? 40;
    const soc = data.social ?? 30;
    const gov = data.governance ?? 30;
    return env + soc + gov === 100;
  },
  {
    message: 'ESG weights must sum up to exactly 100%',
    path: ['environmental'], // Point error to environmental field as general path
  }
);
