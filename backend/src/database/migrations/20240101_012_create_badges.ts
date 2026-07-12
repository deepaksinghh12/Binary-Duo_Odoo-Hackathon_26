import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('badges', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable().unique();
    table.text('description').notNullable();
    table.json('unlock_rule').notNullable(); // {metric: 'xp'|'completedChallenges', operator: '>='|'>', value: number}
    table.string('icon', 255).nullable();
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    table.index(['deleted_at'], 'idx_badges_deleted');
  });

  await knex.schema.createTable('employee_badges', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('employee_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .uuid('badge_id')
      .notNullable()
      .references('id')
      .inTable('badges')
      .onDelete('CASCADE');
    table.timestamp('unlocked_at').defaultTo(knex.fn.now());

    table.unique(['employee_id', 'badge_id'], 'uq_emp_badge');
    table.index(['employee_id'], 'idx_emp_badges_emp');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('employee_badges');
  await knex.schema.dropTableIfExists('badges');
}
