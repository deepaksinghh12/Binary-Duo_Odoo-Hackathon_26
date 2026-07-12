import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('rewards', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description').notNullable();
    table.integer('points_required').unsigned().notNullable();
    table.integer('stock').unsigned().notNullable().defaultTo(0);
    table
      .enu('status', ['active', 'inactive'], {
        useNative: true,
        enumName: 'reward_status',
      })
      .notNullable()
      .defaultTo('active');
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    table.index(['status', 'deleted_at'], 'idx_rewards_status');
  });

  await knex.schema.createTable('reward_redemptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('reward_id')
      .notNullable()
      .references('id')
      .inTable('rewards')
      .onDelete('RESTRICT');
    table
      .uuid('employee_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.integer('points_deducted').unsigned().notNullable();
    table.timestamp('redeemed_at').defaultTo(knex.fn.now());

    table.index(['employee_id'], 'idx_redemptions_emp');
    table.index(['reward_id'], 'idx_redemptions_reward');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('reward_redemptions');
  await knex.schema.dropTableIfExists('rewards');
  await knex.raw('DROP TYPE IF EXISTS reward_status');
}
