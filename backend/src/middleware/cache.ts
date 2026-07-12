import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet } from '../config/redis';
import { sendSuccess } from '../utils/response';

/**
 * Cache middleware for Express
 * @param duration TTL in seconds (default: 300s / 5 minutes)
 */
export const cacheMiddleware = (duration: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Create a unique cache key based on route and user ID (if auth is involved)
      const userId = req.user?.userId ? `user:${req.user.userId}:` : 'global:';
      const cacheKey = `cache:${userId}${req.originalUrl || req.url}`;

      const cachedResponse = await cacheGet(cacheKey);

      if (cachedResponse) {
        const parsedData = JSON.parse(cachedResponse);
        // Serve from cache
        sendSuccess(res, parsedData, 'Data fetched from cache successfully');
        return;
      }

      // If not in cache, intercept the response by overriding res.json
      const originalJson = res.json.bind(res);

      res.json = (body: any) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300 && body.success && body.data) {
          cacheSet(cacheKey, JSON.stringify(body.data), duration).catch(err => {
            console.error('Redis Cache Error:', err);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Redis Cache Middleware Error:', error);
      // Fallback to normal execution if Redis fails
      next();
    }
  };
};
