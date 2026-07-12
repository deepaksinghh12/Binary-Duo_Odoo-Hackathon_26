import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('challenge_participation', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('challenge_id')
      .notNullable()
      .references('id')
      .inTable('challenges')
      .onDelete('CASCADE');
    table
      .uuid('employee_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.integer('progress').unsigned().notNullable().defaultTo(0);
    table.string('proof_url', 500).nullable();
    table
      .enu('approval_status', ['pending', 'approved', 'rejected'], {
        useNative: true,
        enumName: 'participation_approval_status',
      })
      .notNullable()
      .defaultTo('pending');
    table.integer('xp_awarded').unsigned().notNullable().defaultTo(0);
    table.timestamp('completed_at').nullable();
    table.timestamps(true, true);

    table.unique(['challenge_id', 'employee_id'], 'uq_challenge_employee');
    table.index(['employee_id', 'approval_status'], 'idx_challenge_part_emp_status');
    table.index(['challenge_id'], 'idx_challenge_part_challenge');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('challenge_participation');
  await knex.raw('DROP TYPE IF EXISTS participation_approval_status');
}
