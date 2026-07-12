import knex, { Knex } from 'knex';
import { env } from '../config/env';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    database: env.DATABASE_NAME,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  // Timestamps: use snake_case column names
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
};

const db = knex(config);

export default db;
