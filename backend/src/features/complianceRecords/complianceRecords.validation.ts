import { z } from 'zod';

export const createComplianceRecordSchema = z.object({
  entity_type: z.string().min(1, 'Entity type is required'),
  entity_id: z.string().uuid('Invalid entity ID'),
  policy_id: z.string().uuid('Invalid policy ID'),
  compliance_status: z.enum(['compliant', 'non-compliant', 'pending']).default('pending'),
  last_checked: z.union([z.string(), z.date()]).optional().nullable(),
});

export const updateComplianceRecordSchema = createComplianceRecordSchema.partial();
