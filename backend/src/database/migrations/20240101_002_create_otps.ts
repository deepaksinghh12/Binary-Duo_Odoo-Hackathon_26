import type { Knex } from 'knex';

/**
 * Migration: Create otps table
 * Used to store one-time password verification codes for login / signup.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('otps', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table.string('email', 255).notNullable();
    table.string('otp_code', 6).notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('is_used').notNullable().defaultTo(false);
    table.timestamps(true, true);
  });

  // Alter users table to add email verification status
  await knex.schema.alterTable('users', (table) => {
    table.boolean('is_verified').notNullable().defaultTo(false);
  });

  // Indexes for fast lookup
  await knex.schema.alterTable('otps', (table) => {
    table.index(['email', 'otp_code'], 'idx_otps_email_code');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('otps');
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('is_verified');
  });
}
