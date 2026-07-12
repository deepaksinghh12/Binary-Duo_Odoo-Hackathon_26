import { Knex } from 'knex';

/**
 * Migration: Create policy_acknowledgements table
 *
 * Spec (Step 7): Employees acknowledge policies; admin views completion % per policy per dept.
 * Spec (Step 10): Notifications job checks who hasn't acknowledged after N days.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('policy_acknowledgements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('policy_id')
      .notNullable()
      .references('id')
      .inTable('policies')
      .onDelete('CASCADE');

    table
      .uuid('employee_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.timestamp('acknowledged_at').notNullable().defaultTo(knex.fn.now());

    // Prevent duplicate acknowledgements for same policy+employee pair
    table.unique(['policy_id', 'employee_id'], { indexName: 'uq_policy_employee_ack' });

    table.index(['policy_id'], 'idx_policy_ack_policy');
    table.index(['employee_id'], 'idx_policy_ack_employee');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('policy_acknowledgements');
}
