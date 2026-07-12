import { Queue, Worker, Job } from 'bullmq';
import { env } from '../config/env';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
};

// Define queues
export const policyOverdueQueue = new Queue('policyOverdue', { connection });
export const gamificationQueue = new Queue('gamificationAward', { connection });

// Define Workers
const policyWorker = new Worker('policyOverdue', async (job: Job) => {
  console.log(`[Job] Executing policy overdue checker: ${job.id}`);
  // In a real scenario, this queries the DB for missing acknowledgements
  // and inserts rows into the Notifications table.
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`[Job] Policy checker completed successfully.`);
}, { connection });

const gamificationWorker = new Worker('gamificationAward', async (job: Job) => {
  console.log(`[Job] Executing gamification awarder: ${job.id}`);
  // In a real scenario, this calculates total CO2 saved per user
  // and awards badges if thresholds are met.
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`[Job] Gamification awarder completed successfully.`);
}, { connection });

// Setup scheduled jobs (Cron)
export const initJobs = async () => {
  // Clear old repeatable jobs
  await policyOverdueQueue.obliterate({ force: true }).catch(() => {});
  await gamificationQueue.obliterate({ force: true }).catch(() => {});

  // Run daily at midnight
  await policyOverdueQueue.add('check-overdue', {}, {
    repeat: { pattern: '0 0 * * *' }
  });

  // Run hourly
  await gamificationQueue.add('award-badges', {}, {
    repeat: { pattern: '0 * * * *' }
  });

  console.log('⏰ Background jobs initialized via BullMQ');
};
