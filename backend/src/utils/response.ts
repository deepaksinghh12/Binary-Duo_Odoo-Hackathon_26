import { Response } from 'express';
import { ApiSuccess, PaginatedResponse } from '../shared/types';

/**
 * Send a standardised success response.
 * Always use this — never call res.json() directly in feature code.
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response<ApiSuccess<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a standardised paginated list response.
 */
export const sendPaginated = <T>(
  res: Response,
  result: PaginatedResponse<T>,
  message = 'Fetched successfully'
): Response => {
  return res.status(200).json({
    success: true,
    message,
    ...result,
  });
};

/**
 * Parse and clamp pagination query params.
 */
export const parsePagination = (
  page?: string,
  limit?: string
): { page: number; limit: number; offset: number } => {
  const p = Math.max(1, parseInt(page ?? '1', 10));
  const l = Math.min(100, Math.max(1, parseInt(limit ?? '10', 10)));
  return { page: p, limit: l, offset: (p - 1) * l };
};
