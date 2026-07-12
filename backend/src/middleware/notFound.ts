import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../shared/errors';

/**
 * 404 middleware — catches any request that didn't match a route.
 * Must be placed AFTER all route registrations but BEFORE errorHandler.
 */
export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};
