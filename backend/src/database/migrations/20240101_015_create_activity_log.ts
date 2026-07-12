import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('activity_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .enu(
        'type',
        [
          'challenge_completion',
          'compliance_issue',
          'carbon_transaction',
          'policy_acknowledgement',
          'badge_unlock',
          'csr_participation',
          'reward_redemption',
        ],
        {
          useNative: true,
          enumName: 'activity_log_type',
        }
      )
      .notNullable();
    table.text('message').notNullable();
    table.string('entity_type', 100).nullable();
    table.uuid('entity_id').nullable();
    table
      .uuid('department_id')
      .nullable()
      .references('id')
      .inTable('departments')
      .onDelete('SET NULL');
    table
      .uuid('user_id')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['department_id', 'created_at'], 'idx_activity_dept');
    table.index(['type', 'created_at'], 'idx_activity_type');
    table.index(['user_id', 'created_at'], 'idx_activity_user');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('activity_log');
  await knex.raw('DROP TYPE IF EXISTS activity_log_type');
}
