import type { Knex } from 'knex';

/**
 * Migration: Create users table
 *
 * Columns:
 *   id            — UUID primary key (gen_random_uuid from pgcrypto extension)
 *   name          — Full name, max 100 chars
 *   email         — Unique, used for login
 *   password_hash — bcrypt hash, never store plaintext
 *   role          — 'admin' | 'manager' | 'employee'
 *   department_id — nullable FK to departments (added when departments table exists)
 *   xp_total      — gamification XP points, default 0
 *   is_active     — soft disable without deleting account
 *   created_at / updated_at — auto-managed timestamps
 */
export async function up(knex: Knex): Promise<void> {
  // Enable pgcrypto for gen_random_uuid() if not already enabled
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await knex.schema.createTable('users', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table.string('name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash').notNullable();

    table
      .enu('role', ['admin', 'manager', 'employee'], {
        useNative: true,
        enumName: 'user_role',
      })
      .notNullable()
      .defaultTo('employee');

    // department_id added as nullable FK in departments migration
    table.uuid('department_id').nullable();

    table.integer('xp_total').notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);

    table.timestamps(true, true); // created_at, updated_at
  });

  // Index for fast email lookup during login
  await knex.schema.alterTable('users', (table) => {
    table.index(['email'], 'idx_users_email');
    table.index(['role'], 'idx_users_role');
    table.index(['department_id'], 'idx_users_department_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS user_role');
}
