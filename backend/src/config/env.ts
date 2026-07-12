import dotenv from 'dotenv';
dotenv.config();

// ─── Validate required env variables at startup ───────────────────────────────
const required = [
  'DATABASE_HOST',
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'JWT_SECRET',
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `[ENV] Missing required environment variable: ${key}.\nCheck your .env file against .env.example.`
    );
  }
}

export const env = {
  PORT: parseInt(process.env.PORT ?? '5000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  isDev: process.env.NODE_ENV === 'development',

  // Database
  DATABASE_HOST: process.env.DATABASE_HOST as string,
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  DATABASE_NAME: process.env.DATABASE_NAME as string,
  DATABASE_USER: process.env.DATABASE_USER as string,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD as string,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',

  // Redis
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',

  // CORS
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
} as const;
