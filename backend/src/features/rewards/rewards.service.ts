import db from '../../database/knex';
import { cacheDelPattern } from '../../config/redis';
import { NotFoundError, ConflictError } from '../../shared/errors';

export class RewardsService {
  async getAllRewards(filters: any = {}) {
    const { status = 'active', page = 1, limit = 10 } = filters;

    let query = db('rewards').where('deleted_at', null);

    if (status) {
      query = query.where('status', status);
    }

    const total = await query.clone().count('id as count').first().then((r: any) => Number(r?.count || 0));
    const data = await query.orderBy('created_at', 'desc').limit(limit).offset((page - 1) * limit).select('*');

    return { data, total };
  }

  async getRewardById(id: string) {
    const reward = await db('rewards').where({ id, deleted_at: null }).first();
    if (!reward) throw new Error('Reward not found');
    return reward;
  }

  async createReward(data: any) {
    const [reward] = await db('rewards').insert(data).returning('*');
    return reward;
  }

  async updateReward(id: string, data: any) {
    const [reward] = await db('rewards')
      .where({ id, deleted_at: null })
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    if (!reward) throw new Error('Reward not found');
    return reward;
  }

  async deleteReward(id: string) {
    const count = await db('rewards').where({ id, deleted_at: null }).update({ deleted_at: db.fn.now() });
    if (count === 0) throw new Error('Reward not found');
  }

  async redeemReward(rewardId: string, employeeId: string) {
    return await db.transaction(async (trx: any) => {
      // Get reward details with row-level lock
      const reward = await trx('rewards')
        .where({ id: rewardId, deleted_at: null })
        .forUpdate()
        .first();

      if (!reward) throw new NotFoundError('Reward');
      if (reward.status !== 'active') throw new ConflictError('Reward is not currently available');
      if (reward.stock <= 0) throw new ConflictError('Reward is out of stock');

      // Get employee XP with row-level lock
      const employee = await trx('users')
        .where({ id: employeeId })
        .forUpdate()
        .select('xp_total')
        .first();

      if (!employee) throw new NotFoundError('Employee');
      if (employee.xp_total < reward.points_required) {
        throw new ConflictError(
          `Insufficient XP. Required: ${reward.points_required}, available: ${employee.xp_total}`
        );
      }

      // Deduct XP from employee
      await trx('users')
        .where({ id: employeeId })
        .decrement('xp_total', reward.points_required);

      // Decrement stock
      await trx('rewards')
        .where({ id: rewardId })
        .decrement('stock', 1);

      // Create redemption record
      const [redemption] = await trx('reward_redemptions')
        .insert({
          reward_id: rewardId,
          employee_id: employeeId,
          points_deducted: reward.points_required,
        })
        .returning('*');

      // Log activity
      const user = await trx('users').where({ id: employeeId }).select('department_id', 'name').first();
      await trx('activity_log').insert({
        type: 'reward_redemption',
        message: `${user?.name || 'User'} redeemed reward: ${reward.name}`,
        entity_type: 'reward',
        entity_id: rewardId,
        department_id: user?.department_id || null,
        user_id: employeeId,
      });

      // Invalidate leaderboard cache
      await cacheDelPattern('leaderboard:*');

      return redemption;
    });
  }
}
