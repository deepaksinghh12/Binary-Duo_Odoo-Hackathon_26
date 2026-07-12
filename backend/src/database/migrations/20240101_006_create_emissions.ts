import type { Knex } from 'knex';

/**
 * Dummy migration to satisfy corrupt folder log check.
 */
export async function up(knex: Knex): Promise<void> {}

export async function down(knex: Knex): Promise<void> {}
