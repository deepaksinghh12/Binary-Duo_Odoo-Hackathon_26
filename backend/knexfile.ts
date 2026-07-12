// ─── Knexfile — used by the Knex CLI for migrations & seeds ──────────────────
// Must be CommonJS-compatible when called via CLI

import 'dotenv/config';
import type { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT ?? 5432),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    },
    pool: { min: 2, max: 10 },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/database/migrations',
      extension: 'ts',
      loadExtensions: ['.ts'],
    },
    seeds: {
      directory: './src/database/seeds',
      loadExtensions: ['.ts'],
    },
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT ?? 5432),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 20 },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/database/migrations',
      extension: 'ts',
      loadExtensions: ['.ts'],
    },
  },
};

export default config;
module.exports = config; // CommonJS compat for Knex CLI
