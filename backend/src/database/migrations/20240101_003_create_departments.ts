import type { Knex } from 'knex';

/**
 * Migration: Create departments table and link users.department_id FK
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('departments', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table.string('name', 100).notNullable();
    table.string('code', 20).notNullable().unique();
    table.uuid('head_user_id').nullable(); // FK to users (head of dept)
    table.uuid('parent_department_id').nullable(); // self-referencing FK

    table.integer('employee_count').notNullable().defaultTo(0);
    table.string('status', 20).notNullable().defaultTo('active'); // active | inactive
    table.timestamp('deleted_at').nullable(); // soft delete column

    table.timestamps(true, true);
  });

  // Set up foreign key constraints
  await knex.schema.alterTable('departments', (table) => {
    table
      .foreign('head_user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table
      .foreign('parent_department_id')
      .references('id')
      .inTable('departments')
      .onDelete('SET NULL');
  });

  // Update users table to add foreign key constraint on department_id
  await knex.schema.alterTable('users', (table) => {
    table
      .foreign('department_id')
      .references('id')
      .inTable('departments')
      .onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop foreign key first
  await knex.schema.alterTable('users', (table) => {
    table.dropForeign(['department_id']);
  });

  await knex.schema.dropTableIfExists('departments');
}
