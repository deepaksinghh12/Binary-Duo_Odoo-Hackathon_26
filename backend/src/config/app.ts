import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './env';
import { globalRateLimiter } from '../middleware/rateLimiter';
import { notFound } from '../middleware/notFound';
import { errorHandler } from '../middleware/errorHandler';

// ─── Feature Routes ───────────────────────────────────────────────────────────
// (Imported and mounted as features are built — Step 1 only has health/test)

export const createApp = (): Application => {
  const app = express();

  // ── Security Middleware ───────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31_536_000,
        includeSubDomains: true,
      },
    })
  );

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── Request Parsing (size limit prevents large payload attacks) ───────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // ── Request Logging ───────────────────────────────────────────────────────
  if (env.isDev) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // ── Global Rate Limiter ───────────────────────────────────────────────────
  app.use(globalRateLimiter);

  // ── Health & Test Routes ──────────────────────────────────────────────────
  app.get('/health', (_req: express.Request, res: express.Response) => {
    res.status(200).json({
      success: true,
      message: 'EcoSphere API is running',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  app.get('/test', (_req: express.Request, res: express.Response) => {
    res.status(200).json({
      success: true,
      message: 'Test route OK',
    });
  });

  // ── Feature Routes (mounted here as each step is built) ──────────────────
  // app.use('/api/auth', authRoutes);           // Step 3
  // app.use('/api/departments', deptRoutes);   // Step 4
  // app.use('/api/categories', catRoutes);     // Step 4
  // ... more routes added per step

  // ── 404 + Error Handler (always last) ────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
