import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../shared/errors';
import { AuthTokenPayload } from '../shared/types';

/**
 * JWT Authentication Middleware.
 * Extracts JWT from Authorization header (Bearer token format),
 * verifies it, and attaches the payload to req.user.
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access token is missing or malformed'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    req.user = payload; // Attach user claims to request
    next();
  } catch (error) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token has expired'));
    }
    return next(new UnauthorizedError('Invalid access token'));
  }
};
