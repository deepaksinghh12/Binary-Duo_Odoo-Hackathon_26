import db from '../../database/knex';
import type {
  ChallengeParticipation,
  CreateParticipationDto,
  UpdateParticipationDto,
  ParticipationFilters,
} from './challengeParticipation.types';

export class ChallengeParticipationRepository {
  private tableName = 'challenge_participation';

  async findAll(filters: ParticipationFilters = {}): Promise<{ data: any[]; total: number }> {
    const { challenge_id, employee_id, approval_status, page = 1, limit = 10 } = filters;

    let query = db(this.tableName)
      .leftJoin('challenges', 'challenge_participation.challenge_id', 'challenges.id')
      .leftJoin('users', 'challenge_participation.employee_id', 'users.id')
      .select(
        'challenge_participation.*',
        'challenges.title as challenge_title',
        'challenges.xp_reward as challenge_xp',
        'challenges.evidence_required as challenge_evidence_required',
        'users.name as employee_name',
        'users.email as employee_email'
      );

    if (challenge_id) {
      query = query.where('challenge_participation.challenge_id', challenge_id);
    }

    if (employee_id) {
      query = query.where('challenge_participation.employee_id', employee_id);
    }

    if (approval_status) {
      query = query.where('challenge_participation.approval_status', approval_status);
    }

    const total = await query
      .clone()
      .count('challenge_participation.id as count')
      .first()
      .then((row: any) => Number(row?.count || 0));

    const data = await query
      .orderBy('challenge_participation.created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return { data, total };
  }

  async findById(id: string): Promise<ChallengeParticipation | null> {
    return db(this.tableName).where({ id }).first();
  }

  async findByEmployeeAndChallenge(
    employeeId: string,
    challengeId: string
  ): Promise<ChallengeParticipation | null> {
    return db(this.tableName)
      .where({ employee_id: employeeId, challenge_id: challengeId })
      .first();
  }

  async create(data: CreateParticipationDto): Promise<ChallengeParticipation> {
    const [participation] = await db(this.tableName).insert(data).returning('*');
    return participation;
  }

  async update(id: string, data: UpdateParticipationDto): Promise<ChallengeParticipation | null> {
    const [participation] = await db(this.tableName)
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    return participation || null;
  }

  async updateApprovalStatus(
    id: string,
    status: string,
    xpAwarded?: number
  ): Promise<ChallengeParticipation | null> {
    const updateData: any = {
      approval_status: status,
      updated_at: db.fn.now(),
    };

    if (status === 'approved' && xpAwarded !== undefined) {
      updateData.xp_awarded = xpAwarded;
      updateData.completed_at = db.fn.now();
    }

    const [participation] = await db(this.tableName).where({ id }).update(updateData).returning('*');
    return participation || null;
  }

  async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName).where({ id }).delete();
    return count > 0;
  }
}
