import type { Knex } from 'knex';

/**
 * Migration: Create refresh_tokens table for token rotation
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('refresh_tokens', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.string('token', 500).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.boolean('is_revoked').notNullable().defaultTo(false);
    
    table.timestamps(true, true);
  });

  // Index for fast lookups and expiry cleans
  await knex.schema.alterTable('refresh_tokens', (table) => {
    table.index(['token'], 'idx_refresh_tokens_lookup');
    table.index(['user_id'], 'idx_refresh_tokens_user');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('refresh_tokens');
}
