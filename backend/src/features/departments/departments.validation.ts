import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Code must be at least 2 characters').max(20).toUpperCase(),
  headUserId: z.string().uuid('Invalid user ID for department head').optional(),
  parentDepartmentId: z.string().uuid('Invalid parent department ID').optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  code: z.string().min(2, 'Code must be at least 2 characters').max(20).toUpperCase().optional(),
  headUserId: z.string().uuid('Invalid user ID for department head').nullable().optional(),
  parentDepartmentId: z.string().uuid('Invalid parent department ID').nullable().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});
