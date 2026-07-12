import db from '../database/knex';
import { cacheDelPattern } from '../config/redis';

interface BadgeUnlockRule {
  metric: 'xp' | 'completedChallenges';
  operator: '>=' | '>';
  value: number;
}

export class BadgeCheckerService {
  /**
   * Check and auto-award badges to an employee based on their current metrics
   * Called after XP or challenge completion changes
   */
  async checkAndAwardBadges(employeeId: string): Promise<string[]> {
    // Check if auto-award is enabled in settings
    const autoAwardSetting = await db('settings')
      .where({ key: 'badge_auto_award_enabled' })
      .first();

    if (!autoAwardSetting || autoAwardSetting.value !== 'true') {
      return []; // Auto-award is disabled
    }

    // Get employee's current metrics
    const employee = await db('users')
      .where({ id: employeeId })
      .select('xp_total', 'completed_challenges_count')
      .first();

    if (!employee) {
      return [];
    }

    // Get all active badges that the employee doesn't have yet
    const unlockedBadgeIds = await db('employee_badges')
      .where({ employee_id: employeeId })
      .pluck('badge_id');

    const availableBadges = await db('badges')
      .where('deleted_at', null)
      .whereNotIn('id', unlockedBadgeIds.length > 0 ? unlockedBadgeIds : ['00000000-0000-0000-0000-000000000000'])
      .select('*');

    const newlyAwardedBadges: string[] = [];

    for (const badge of availableBadges) {
      const rule = badge.unlock_rule as BadgeUnlockRule;
      let metricValue = 0;

      if (rule.metric === 'xp') {
        metricValue = employee.xp_total;
      } else if (rule.metric === 'completedChallenges') {
        metricValue = employee.completed_challenges_count;
      }

      // Check if the employee meets the unlock criteria
      const meetsCondition =
        rule.operator === '>='
          ? metricValue >= rule.value
          : metricValue > rule.value;

      if (meetsCondition) {
        // Award the badge
        await db('employee_badges').insert({
          employee_id: employeeId,
          badge_id: badge.id,
        });

        newlyAwardedBadges.push(badge.id);

        // Create notification (will be handled by notification service)
        await this.createBadgeUnlockNotification(employeeId, badge.name);

        // Log activity
        await this.logBadgeUnlock(employeeId, badge.name);
      }
    }

    // Invalidate leaderboard cache if badges were awarded
    if (newlyAwardedBadges.length > 0) {
      await cacheDelPattern('leaderboard:*');
    }

    return newlyAwardedBadges;
  }

  private async createBadgeUnlockNotification(employeeId: string, badgeName: string): Promise<void> {
    await db('notifications').insert({
      user_id: employeeId,
      type: 'badge_unlock',
      message: `Congratulations! You've unlocked the "${badgeName}" badge!`,
      read: false,
    });
  }

  private async logBadgeUnlock(employeeId: string, badgeName: string): Promise<void> {
    const user = await db('users').where({ id: employeeId }).select('department_id').first();

    await db('activity_log').insert({
      type: 'badge_unlock',
      message: `Badge unlocked: ${badgeName}`,
      entity_type: 'badge',
      department_id: user?.department_id || null,
      user_id: employeeId,
    });
  }
}
