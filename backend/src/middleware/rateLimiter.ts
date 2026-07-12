import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter — applied to ALL routes.
 * 100 requests per 15 minutes per IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
  skip: (req) => req.path === '/health', // Never rate-limit health check
});

/**
 * Strict auth limiter — applied to /auth/login and /auth/signup.
 * 5 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

/**
 * Report endpoint limiter — reports are expensive aggregation queries.
 * 30 requests per 15 minutes per IP.
 */
export const reportRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many report requests. Please wait before requesting again.',
  },
});
