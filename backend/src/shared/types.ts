// ─── Shared TypeScript types used across multiple features ────────────────────

import { Request } from 'express';

/** JWT payload attached to req.user after authenticate middleware */
export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export type UserRole = 'admin' | 'manager' | 'employee';

/** Standard API success response shape */
export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data: T;
}

/** Standard API error response shape */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Common query params for list endpoints */
export interface ListQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Extend Express Request to include the authenticated user */
export interface AuthenticatedRequest extends Request {
  user: AuthTokenPayload;
}
