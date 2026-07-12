import { Response, NextFunction } from 'express';
import { ForbiddenError } from '../shared/errors';
import { AuthenticatedRequest, UserRole } from '../shared/types';

/**
 * Role Authorisation Middleware.
 * Guards routes by checking if req.user has one of the allowed roles.
 * Must be mounted AFTER the authenticate middleware.
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('User context not found. Authentication required first.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource.'));
    }

    next();
  };
};
