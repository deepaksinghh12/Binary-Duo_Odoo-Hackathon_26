import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .enu(
        'type',
        [
          'compliance_issue',
          'csr_approval',
          'challenge_approval',
          'policy_reminder',
          'badge_unlock',
          'compliance_overdue',
        ],
        {
          useNative: true,
          enumName: 'notification_type',
        }
      )
      .notNullable();
    table.text('message').notNullable();
    table.boolean('read').notNullable().defaultTo(false);
    table.json('metadata').nullable(); // Additional context data
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['user_id', 'read', 'created_at'], 'idx_notif_user_read');
    table.index(['type'], 'idx_notif_type');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notifications');
  await knex.raw('DROP TYPE IF EXISTS notification_type');
}
