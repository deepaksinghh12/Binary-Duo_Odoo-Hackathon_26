import db from '../../database/knex';
import type { Challenge, CreateChallengeDto, UpdateChallengeDto, ChallengeFilters } from './challenges.types';

export class ChallengesRepository {
  private tableName = 'challenges';

  async findAll(filters: ChallengeFilters = {}): Promise<{ data: Challenge[]; total: number }> {
    const { status, difficulty, category_id, search, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = filters;

    let query = db(this.tableName).where('deleted_at', null);

    if (status) {
      query = query.where('status', status);
    }

    if (difficulty) {
      query = query.where('difficulty', difficulty);
    }

    if (category_id) {
      query = query.where('category_id', category_id);
    }

    if (search) {
      query = query.where((builder: any) => {
        builder.where('title', 'ilike', `%${search}%`).orWhere('description', 'ilike', `%${search}%`);
      });
    }

    const total = await query.clone().count('id as count').first().then((row: any) => Number(row?.count || 0));

    const data = await query
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset((page - 1) * limit)
      .select('*');

    return { data, total };
  }

  async findById(id: string): Promise<Challenge | null> {
    return db(this.tableName).where({ id, deleted_at: null }).first();
  }

  async create(data: CreateChallengeDto): Promise<Challenge> {
    const [challenge] = await db(this.tableName).insert(data).returning('*');
    return challenge;
  }

  async update(id: string, data: UpdateChallengeDto): Promise<Challenge | null> {
    const [challenge] = await db(this.tableName)
      .where({ id, deleted_at: null })
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    return challenge || null;
  }

  async softDelete(id: string): Promise<boolean> {
    const count = await db(this.tableName)
      .where({ id, deleted_at: null })
      .update({ deleted_at: db.fn.now() });
    return count > 0;
  }

  async incrementParticipantCount(challengeId: string): Promise<void> {
    await db(this.tableName)
      .where({ id: challengeId })
      .increment('participant_count', 1);
  }

  async decrementParticipantCount(challengeId: string): Promise<void> {
    await db(this.tableName)
      .where({ id: challengeId })
      .decrement('participant_count', 1);
  }
}
