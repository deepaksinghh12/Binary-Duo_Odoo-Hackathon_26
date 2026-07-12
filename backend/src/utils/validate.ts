import { ZodError } from 'zod';

/**
 * Flatten a ZodError into a Record<fieldName, string[]> for consistent API error responses.
 */
export const formatZodError = (error: ZodError): Record<string, string[]> => {
  return error.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = issue.path.join('.') || 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue.message);
    return acc;
  }, {});
};

/**
 * Validate data with a Zod schema and throw a structured ValidationError on failure.
 * Use this in service layer — never in routes.
 */
import { ZodSchema } from 'zod';
import { ValidationError } from '../shared/errors';

export const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(formatZodError(result.error));
  }
  return result.data;
};
