import { Knex } from 'knex';

/**
 * Migration: Create compliance_issues table
 *
 * Spec (Step 7): Each issue must have an owner and a due_date — both NOT NULL.
 * Links to an audit (which links to a department), and tracks open/overdue state.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('compliance_issues', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('audit_id')
      .notNullable()
      .references('id')
      .inTable('audits')
      .onDelete('CASCADE');

    table
      .enu('severity', ['low', 'medium', 'high', 'critical'], {
        useNative: true,
        enumName: 'compliance_severity',
      })
      .notNullable();

    table.text('description').notNullable();

    // owner_id is required — rejection enforced at service layer AND here via notNullable
    table
      .uuid('owner_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    // due_date is required — rejection enforced at service layer AND here via notNullable
    table.date('due_date').notNullable();

    table
      .enu('status', ['open', 'in_progress', 'resolved'], {
        useNative: true,
        enumName: 'compliance_issue_status',
      })
      .notNullable()
      .defaultTo('open');

    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    table.index(['audit_id'], 'idx_compliance_issues_audit');
    table.index(['owner_id'], 'idx_compliance_issues_owner');
    table.index(['status', 'due_date'], 'idx_compliance_issues_status_due');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('compliance_issues');
  await knex.raw('DROP TYPE IF EXISTS compliance_issue_status');
  await knex.raw('DROP TYPE IF EXISTS compliance_severity');
}
