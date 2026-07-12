import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('challenges', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table
      .uuid('category_id')
      .notNullable()
      .references('id')
      .inTable('categories')
      .onDelete('RESTRICT');
    table.text('description').notNullable();
    table.integer('xp_reward').unsigned().notNullable().defaultTo(0);
    table
      .enu('difficulty', ['easy', 'medium', 'hard'], {
        useNative: true,
        enumName: 'challenge_difficulty',
      })
      .notNullable()
      .defaultTo('medium');
    table.boolean('evidence_required').notNullable().defaultTo(false);
    table.timestamp('deadline').nullable();
    table
      .enu('status', ['draft', 'active', 'under_review', 'completed', 'archived'], {
        useNative: true,
        enumName: 'challenge_status',
      })
      .notNullable()
      .defaultTo('draft');
    table.integer('participant_count').unsigned().notNullable().defaultTo(0);
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    table.index(['status', 'deleted_at'], 'idx_challenges_status');
    table.index(['category_id'], 'idx_challenges_category');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('challenges');
  await knex.raw('DROP TYPE IF EXISTS challenge_difficulty');
  await knex.raw('DROP TYPE IF EXISTS challenge_status');
}
