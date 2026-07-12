import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Policies Table
  await knex.schema.createTable('policies', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.string('url', 500).nullable();
    table.string('status', 50).notNullable().defaultTo('active'); // active, inactive, draft
    table
      .uuid('department_id')
      .nullable()
      .references('id')
      .inTable('departments')
      .onDelete('SET NULL');
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    table.index(['department_id'], 'idx_policies_dept');
    table.index(['status'], 'idx_policies_status');
  });

  // 2. Compliance Records Table
  await knex.schema.createTable('compliance_records', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table.string('entity_type', 50).notNullable(); // e.g. 'department', 'product', 'user'
    table.uuid('entity_id').notNullable(); // Polymorphic UUID
    table
      .uuid('policy_id')
      .notNullable()
      .references('id')
      .inTable('policies')
      .onDelete('CASCADE');
    table.string('compliance_status', 50).notNullable().defaultTo('pending'); // compliant, non-compliant, pending
    table.timestamp('last_checked').nullable();
    table.timestamps(true, true);

    table.index(['entity_type', 'entity_id'], 'idx_compliance_entity');
    table.index(['policy_id'], 'idx_compliance_policy');
    table.index(['compliance_status'], 'idx_compliance_status');
  });

  // 3. Audits Table
  await knex.schema.createTable('audits', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 200).notNullable();
    table
      .uuid('auditor_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');
    table.date('date').notNullable();
    table.string('status', 50).notNullable().defaultTo('planned'); // planned, ongoing, completed
    table.text('findings').nullable();
    table.text('resolution').nullable();
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    table.index(['auditor_id'], 'idx_audits_auditor');
    table.index(['status'], 'idx_audits_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audits');
  await knex.schema.dropTableIfExists('compliance_records');
  await knex.schema.dropTableIfExists('policies');
}
