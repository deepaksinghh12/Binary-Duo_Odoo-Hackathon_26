import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './env';
import { globalRateLimiter } from '../middleware/rateLimiter';
import { notFound } from '../middleware/notFound';
import { errorHandler } from '../middleware/errorHandler';

// ─── Feature Routes ───────────────────────────────────────────────────────────
import authRoutes from '../features/auth/auth.routes';
import dashboardRoutes from '../features/dashboard/dashboard.routes';
import departmentsRoutes from '../features/departments/departments.routes';
import categoriesRoutes from '../features/categories/categories.routes';

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
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'EcoSphere API is running',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  app.get('/test', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Test route OK',
    });
  });

  // ── Feature Routes ────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/departments', departmentsRoutes);
  app.use('/api/categories', categoriesRoutes);

  // ── 404 + Error Handler (always last) ────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
