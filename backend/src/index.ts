import { createApp } from './config/app';
import { env } from './config/env';
import db from './database/knex';

const bootstrap = async (): Promise<void> => {
  // ── Test database connection ──────────────────────────────────────────────
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database Connected Successfully');
  } catch (error) {
    console.error('❌ Database Connection Failed:', (error as Error).message);
    console.error(
      '\nCheck your .env file:\n  DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD'
    );
    process.exit(1);
  }

  // ── Start Express server ──────────────────────────────────────────────────
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`\n🚀 EcoSphere API running on http://localhost:${env.PORT}`);
    console.log(`   Environment : ${env.NODE_ENV}`);
    console.log(`   Health check: http://localhost:${env.PORT}/health\n`);
  });

  // ── Scheduled Background Jobs (12-hour intervals) ─────────────────────────
  const { NotificationsService } = require('./features/notifications/notifications.service');
  const notificationsService = new NotificationsService();

  const complianceJobInterval = setInterval(async () => {
    try {
      console.log('⏰ Running scheduled task: Overdue Compliance Issues check...');
      const res = await notificationsService.notifyOverdueComplianceIssues();
      console.log(`✅ Compliance check complete. Notified: ${res.notified_count}`);
    } catch (e) {
      console.error('❌ Compliance check failed:', e);
    }
  }, 12 * 60 * 60 * 1000);

  const policyReminderInterval = setInterval(async () => {
    try {
      console.log('⏰ Running scheduled task: Unacknowledged Policy Reminders check...');
      await notificationsService.sendPolicyReminders();
      console.log('✅ Policy reminders complete.');
    } catch (e) {
      console.error('❌ Policy reminders failed:', e);
    }
  }, 12 * 60 * 60 * 1000);

  // Run once immediately on start for test verification
  setTimeout(() => {
    notificationsService.notifyOverdueComplianceIssues().catch(console.error);
    notificationsService.sendPolicyReminders().catch(console.error);
  }, 5000);

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[${signal}] Shutting down gracefully...`);
    clearInterval(complianceJobInterval);
    clearInterval(policyReminderInterval);
    server.close(async () => {
      await db.destroy();
      console.log('Database connections closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // ── Catch unhandled promise rejections ────────────────────────────────────
  process.on('unhandledRejection', (reason) => {
    console.error('[UnhandledRejection]', reason);
    // In production you'd want to alert monitoring here
  });
};

bootstrap().catch((err: unknown) => {
  console.error('[Bootstrap Error]', err);
  process.exit(1);
});
