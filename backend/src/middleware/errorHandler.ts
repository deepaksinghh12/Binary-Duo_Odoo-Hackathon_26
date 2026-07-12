import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../shared/errors';
import { env } from '../config/env';

/**
 * Global error handling middleware.
 * Must be the LAST app.use() call in app.ts.
 *
 * Rules:
 *  - Never expose stack traces or internal messages in production.
 *  - Use AppError subclasses for all operational errors.
 *  - Unknown errors → 500 with a generic message.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── Validation Error (Zod) ────────────────────────────────────────────────
  if (err instanceof ValidationError) {
    res.status(422).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // ── Known operational errors ──────────────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // ── Unknown / programming errors ──────────────────────────────────────────
  // Log full error internally but return a safe message to the client
  console.error('[UnhandledError]', err);

  res.status(500).json({
    success: false,
    message: env.isDev
      ? err.message // Full message only in dev
      : 'An unexpected error occurred. Please try again later.',
    ...(env.isDev && { stack: err.stack }),
  });
};
