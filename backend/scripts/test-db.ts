/**
 * Database Connection Test Script
 *
 * Run: npx tsx scripts/test-db.ts
 *
 * This script:
 *  1. Loads .env
 *  2. Attempts to connect to PostgreSQL
 *  3. Prints connection result
 *  4. Lists all tables (to verify migration ran)
 */

import 'dotenv/config';
import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 5432),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
});

async function testConnection(): Promise<void> {
  console.log('\n🔍 Testing PostgreSQL connection...');
  console.log(`   Host     : ${process.env.DATABASE_HOST}`);
  console.log(`   Port     : ${process.env.DATABASE_PORT}`);
  console.log(`   Database : ${process.env.DATABASE_NAME}`);
  console.log(`   User     : ${process.env.DATABASE_USER}`);
  console.log('');

  try {
    await db.raw('SELECT 1');
    console.log('✅ Database Connected Successfully!\n');

    // List all tables in the public schema
    const tables = await db
      .select('tablename')
      .from('pg_tables')
      .where({ schemaname: 'public' })
      .orderBy('tablename');

    if (tables.length === 0) {
      console.log('ℹ️  No tables found. Run: npm run migrate');
    } else {
      console.log('📋 Tables in database:');
      tables.forEach((t: { tablename: string }) => {
        console.log(`   - ${t.tablename}`);
      });
    }
  } catch (error) {
    const err = error as Error & { code?: string };
    console.error('❌ Database Connection Failed!\n');

    if (err.code === 'ECONNREFUSED') {
      console.error(
        '   PostgreSQL is not running or the host/port is wrong.\n' +
        '   → Start PostgreSQL service\n' +
        '   → Verify DATABASE_HOST and DATABASE_PORT in .env'
      );
    } else if (err.code === '3D000') {
      console.error(
        `   Database "${process.env.DATABASE_NAME}" does not exist.\n` +
        '   → Run in psql: CREATE DATABASE ecosphere_db;\n' +
        '   → Or create it in pgAdmin'
      );
    } else if (err.code === '28P01') {
      console.error(
        '   Authentication failed — wrong username or password.\n' +
        '   → Check DATABASE_USER and DATABASE_PASSWORD in .env'
      );
    } else {
      console.error(`   Error: ${err.message}`);
    }

    process.exit(1);
  } finally {
    await db.destroy();
  }
}

testConnection().catch(console.error);
