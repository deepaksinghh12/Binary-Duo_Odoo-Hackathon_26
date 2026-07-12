// ─── Custom Application Errors ────────────────────────────────────────────────

/**
 * Base application error — use this instead of throwing plain Error objects.
 * Middleware checks instanceof AppError to set the HTTP status code.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — Bad request / invalid input that passed Zod but failed business logic */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/** 401 — Unauthenticated (no or invalid token) */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/** 403 — Authenticated but not allowed (wrong role) */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/** 404 — Resource not found */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/** 409 — Conflict (e.g. duplicate email) */
export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/** 422 — Zod validation errors */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 422);
    this.errors = errors;
  }
}

/** 429 — Rate limit (also handled by express-rate-limit itself) */
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429);
  }
}
