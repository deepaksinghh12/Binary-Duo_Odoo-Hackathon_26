import type { Knex } from 'knex';

/**
 * Migration: Create Settings and Environmental module tables
 */
export async function up(knex: Knex): Promise<void> {
  // 1. Settings Table (Key/Value store)
  await knex.schema.createTable('settings', (table) => {
    table.string('key', 100).primary();
    table.text('value').notNullable();
    table.text('description').nullable();
    table.timestamps(true, true);
  });

  // Insert default setting for auto-calculate emissions
  await knex('settings').insert({
    key: 'auto_calculate_emissions',
    value: 'false',
    description: 'Toggle automatic carbon calculations for emission logs'
  });

  // 2. Emission Factors Table
  await knex.schema.createTable('emission_factors', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 200).notNullable();
    table.string('activity_type', 100).notNullable();
    table.string('unit', 50).notNullable();
    table.decimal('co2e_factor', 12, 6).notNullable();
    table.string('source', 200).nullable();
    table.string('status', 20).notNullable().defaultTo('active'); // active / inactive
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);
  });

  // 3. Environmental Goals Table
  await knex.schema.createTable('environmental_goals', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('department_id')
      .notNullable()
      .references('id')
      .inTable('departments')
      .onDelete('RESTRICT');
    table.string('target_metric', 100).notNullable(); // e.g. "CO2 Reduction", "Electricity Save"
    table.decimal('target_value', 12, 2).notNullable();
    table.date('target_date').notNullable();
    table.decimal('current_progress', 12, 2).notNullable().defaultTo(0);
    table.string('status', 20).notNullable().defaultTo('active'); // active / achieved / failed
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);
  });

  // 4. Product ESG Profiles Table
  await knex.schema.createTable('product_esg_profiles', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table.string('product_name', 200).notNullable();
    table
      .uuid('category_id')
      .notNullable()
      .references('id')
      .inTable('categories')
      .onDelete('RESTRICT');
    table
      .uuid('emission_factor_id')
      .notNullable()
      .references('id')
      .inTable('emission_factors')
      .onDelete('RESTRICT');
    table.text('notes').nullable();
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);
  });

  // 5. Carbon Transactions Table
  await knex.schema.createTable('carbon_transactions', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('department_id')
      .notNullable()
      .references('id')
      .inTable('departments')
      .onDelete('RESTRICT');
    table.string('activity_type', 100).notNullable(); // e.g., purchase, fleet, manufacturing
    table.decimal('quantity', 12, 2).notNullable();
    table
      .uuid('emission_factor_id')
      .notNullable()
      .references('id')
      .inTable('emission_factors')
      .onDelete('RESTRICT');
    table.decimal('co2e_calculated', 15, 4).notNullable(); // quantity * factor
    table
      .string('source_type', 50)
      .notNullable()
      .defaultTo('manual'); // purchase/manufacturing/expense/fleet/manual
    table.string('source_record_id', 100).nullable();
    table.timestamp('transaction_date').notNullable().defaultTo(knex.fn.now());
    table
      .uuid('created_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');
    table.timestamps(true, true);
  });

  // Alter tables to add indices for fast lookups
  await knex.schema.alterTable('emission_factors', (table) => {
    table.index(['activity_type'], 'idx_emission_factors_activity');
  });
  await knex.schema.alterTable('environmental_goals', (table) => {
    table.index(['department_id'], 'idx_env_goals_dept');
  });
  await knex.schema.alterTable('product_esg_profiles', (table) => {
    table.index(['category_id'], 'idx_product_esg_cat');
  });
  await knex.schema.alterTable('carbon_transactions', (table) => {
    table.index(['department_id'], 'idx_carbon_trans_dept');
    table.index(['transaction_date'], 'idx_carbon_trans_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('carbon_transactions');
  await knex.schema.dropTableIfExists('product_esg_profiles');
  await knex.schema.dropTableIfExists('environmental_goals');
  await knex.schema.dropTableIfExists('emission_factors');
  await knex.schema.dropTableIfExists('settings');
}
