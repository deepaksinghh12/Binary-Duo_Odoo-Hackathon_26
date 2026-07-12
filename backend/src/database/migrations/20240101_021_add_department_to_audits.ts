import { Knex } from 'knex';

/**
 * Migration: Add department_id to audits table
 *
 * The audits table (migration 009) was created without a department_id column.
 * The governance scoring and compliance reports join compliance_issues → audits.department_id,
 * so this column is required for those queries to work correctly.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('audits', (table) => {
    table
      .uuid('department_id')
      .nullable()
      .references('id')
      .inTable('departments')
      .onDelete('SET NULL');

    table.index(['department_id'], 'idx_audits_department');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('audits', (table) => {
    table.dropIndex([], 'idx_audits_department');
    table.dropColumn('department_id');
  });
}
