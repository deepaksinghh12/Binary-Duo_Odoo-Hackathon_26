import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('department_scores', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('department_id')
      .notNullable()
      .references('id')
      .inTable('departments')
      .onDelete('CASCADE');
    table.decimal('environmental_score', 5, 2).notNullable().defaultTo(0);
    table.decimal('social_score', 5, 2).notNullable().defaultTo(0);
    table.decimal('governance_score', 5, 2).notNullable().defaultTo(0);
    table.decimal('total_score', 5, 2).notNullable().defaultTo(0);
    table.integer('total_xp').unsigned().notNullable().defaultTo(0); // Department aggregate XP
    table.timestamp('calculated_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);

    table.index(['department_id', 'calculated_at'], 'idx_dept_scores_dept');
    table.index(['total_score'], 'idx_dept_scores_total');
    table.index(['total_xp'], 'idx_dept_scores_xp');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('department_scores');
}
