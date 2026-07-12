import type { Knex } from 'knex';

/**
 * Migration: Create Social module tables (CSR and Participation)
 */
export async function up(knex: Knex): Promise<void> {
  // 1. Insert default setting for CSR Evidence Requirement
  await knex('settings').insert({
    key: 'csr_evidence_required',
    value: 'true',
    description: 'Require proof of participation for CSR activities'
  });

  // 2. CSR Activities Table
  await knex.schema.createTable('csr_activities', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 200).notNullable();
    table
      .uuid('category_id')
      .notNullable()
      .references('id')
      .inTable('categories')
      .onDelete('RESTRICT');
    table.text('description').nullable();
    table
      .uuid('department_id')
      .notNullable()
      .references('id')
      .inTable('departments')
      .onDelete('RESTRICT');
    table.date('date').notNullable();
    table.string('status', 50).notNullable().defaultTo('active');
    table.integer('points_value').notNullable().defaultTo(0);
    table.boolean('evidence_required').nullable(); // If null, falls back to settings table
    table.integer('joined_count').notNullable().defaultTo(0);
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    table.index(['department_id'], 'idx_csr_activities_dept');
    table.index(['category_id'], 'idx_csr_activities_cat');
    table.index(['status'], 'idx_csr_activities_status');
  });

  // 3. Employee Participation Table
  await knex.schema.createTable('employee_participation', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('employee_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .uuid('csr_activity_id')
      .notNullable()
      .references('id')
      .inTable('csr_activities')
      .onDelete('CASCADE');
    table.text('proof_url').nullable();
    table.string('approval_status', 50).notNullable().defaultTo('pending'); // pending, approved, rejected
    table.integer('points_earned').notNullable().defaultTo(0);
    table.timestamp('completion_date').nullable();
    table.timestamps(true, true);

    table.index(['employee_id'], 'idx_emp_part_emp');
    table.index(['csr_activity_id'], 'idx_emp_part_csr');
    table.index(['approval_status'], 'idx_emp_part_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('employee_participation');
  await knex.schema.dropTableIfExists('csr_activities');
  
  await knex('settings').where({ key: 'csr_evidence_required' }).delete();
}
