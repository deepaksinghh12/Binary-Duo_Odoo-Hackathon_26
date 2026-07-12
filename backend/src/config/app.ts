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
import settingsRoutes from '../features/settings/settings.routes';
import emissionFactorsRoutes from '../features/emissionFactors/emissionFactors.routes';
import environmentalGoalsRoutes from '../features/environmentalGoals/environmentalGoals.routes';
import productEsgProfilesRoutes from '../features/productEsgProfiles/productEsgProfiles.routes';
import carbonTransactionsRoutes from '../features/carbonTransactions/carbonTransactions.routes';
import csrActivitiesRoutes from '../features/csrActivities/csrActivities.routes';
import employeeParticipationRoutes from '../features/employeeParticipation/employeeParticipation.routes';
import socialMetricsRoutes from '../features/socialMetrics/socialMetrics.routes';
import policiesRoutes from '../features/policies/policies.routes';
import complianceRecordsRoutes from '../features/complianceRecords/complianceRecords.routes';
import auditsRoutes from '../features/audits/audits.routes';
// Step 8 — Gamification
import challengesRoutes from '../features/challenges/challenges.routes';
import challengeParticipationRoutes from '../features/challengeParticipation/challengeParticipation.routes';
import rewardsRoutes from '../features/rewards/rewards.routes';
import leaderboardRoutes from '../features/leaderboard/leaderboard.routes';
// Step 9 — Scoring & Reports
import departmentScoresRoutes from '../features/departmentScores/departmentScores.routes';
import reportsRoutes from '../features/reports/reports.routes';
// Step 10 — Notifications
import notificationsRoutes from '../features/notifications/notifications.routes';
import badgesRoutes from '../features/badges/badges.routes';
import complianceIssuesRoutes from '../features/complianceIssues/complianceIssues.routes';
import { policyAcknowledgementsRouter } from '../features/policies/policyAcknowledgements.routes';
import esgScoreRoutes from '../features/esgScore/esgScore.routes';

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
  app.use('/api/settings', settingsRoutes);
  app.use('/api/emission-factors', emissionFactorsRoutes);
  app.use('/api/environmental-goals', environmentalGoalsRoutes);
  app.use('/api/product-esg-profiles', productEsgProfilesRoutes);
  app.use('/api/carbon-transactions', carbonTransactionsRoutes);
  app.use('/api/csr-activities', csrActivitiesRoutes);
  app.use('/api/employee-participation', employeeParticipationRoutes);
  app.use('/api/social-metrics', socialMetricsRoutes);
  app.use('/api/policies', policiesRoutes);
  app.use('/api/compliance-records', complianceRecordsRoutes);
  app.use('/api/audits', auditsRoutes);
  // Step 8 — Gamification
  app.use('/api/challenges', challengesRoutes);
  app.use('/api/challenge-participation', challengeParticipationRoutes);
  app.use('/api/rewards', rewardsRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  // Step 9 — Scoring & Reports
  app.use('/api/department-scores', departmentScoresRoutes);
  app.use('/api/reports', reportsRoutes);
  // Step 10 — Notifications
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/badges', badgesRoutes);
  app.use('/api/compliance-issues', complianceIssuesRoutes);
  app.use('/api/policies', policyAcknowledgementsRouter); // Mount nested acknowledgement routes under policies prefix
  app.use('/api/esg-score', esgScoreRoutes);

  // ── 404 + Error Handler (always last) ────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
