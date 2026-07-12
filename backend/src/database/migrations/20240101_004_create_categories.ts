import type { Knex } from 'knex';

/**
 * Migration: Create categories table
 * Categories acts as a shared taxonomy for CSR Activities and Challenges.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('categories', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table.string('name', 100).notNullable();
    table
      .enu('type', ['csr_activity', 'challenge'], {
        useNative: true,
        enumName: 'category_type',
      })
      .notNullable();

    table.string('status', 20).notNullable().defaultTo('active'); // active | inactive
    table.timestamp('deleted_at').nullable(); // soft delete column

    table.timestamps(true, true);
  });

  // Indexes for fast lookups by status/type
  await knex.schema.alterTable('categories', (table) => {
    table.index(['type', 'status'], 'idx_categories_type_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('categories');
  await knex.raw('DROP TYPE IF EXISTS category_type');
}
