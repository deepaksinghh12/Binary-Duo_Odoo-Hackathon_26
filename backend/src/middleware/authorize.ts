import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../shared/errors';
import { AuthenticatedRequest, UserRole } from '../shared/types';

/**
 * Role Authorisation Middleware.
 * Guards routes by checking if req.user has one of the allowed roles.
 * Must be mounted AFTER the authenticate middleware.
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return next(new ForbiddenError('User context not found. Authentication required first.'));
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource.'));
    }

    next();
  };
};
