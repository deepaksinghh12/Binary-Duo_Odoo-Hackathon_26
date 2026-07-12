import db from '../../database/knex';

export class NotificationsService {
  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, filters: any = {}) {
    const { read, type, page = 1, limit = 20 } = filters;

    let query = db('notifications').where('user_id', userId);

    if (read !== undefined) {
      query = query.where('read', read === 'true' || read === true);
    }

    if (type) {
      query = query.where('type', type);
    }

    const total = await query.clone().count('id as count').first().then((r: any) => Number(r?.count || 0));

    const data = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .select('*');

    return { data, total };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const [notification] = await db('notifications')
      .where({ id: notificationId, user_id: userId })
      .update({ read: true })
      .returning('*');

    if (!notification) throw new Error('Notification not found');
    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    await db('notifications')
      .where({ user_id: userId, read: false })
      .update({ read: true });
  }

  /**
   * Create a notification
   */
  async createNotification(data: {
    user_id: string;
    type: 'compliance_issue' | 'csr_approval' | 'challenge_approval' | 'policy_reminder' | 'badge_unlock' | 'compliance_overdue';
    message: string;
    metadata?: any;
  }) {
    const [notification] = await db('notifications').insert(data).returning('*');

    // Check if email notifications are enabled for this type
    await this.sendEmailIfEnabled(data.user_id, data.type, data.message);

    return notification;
  }

  /**
   * Check for overdue compliance issues and create notifications
   * This should be called by a scheduled job (cron)
   */
  async notifyOverdueComplianceIssues() {
    const overdueIssues = await db('compliance_issues')
      .where('status', 'open')
      .where('due_date', '<', db.fn.now())
      .select('*');

    for (const issue of overdueIssues) {
      // Notify the owner
      if (issue.owner_id) {
        await this.createNotification({
          user_id: issue.owner_id,
          type: 'compliance_overdue',
          message: `Compliance issue "${issue.description}" is overdue. Due date was ${new Date(
            issue.due_date
          ).toLocaleDateString()}.`,
          metadata: { issue_id: issue.id },
        });
      }
    }

    return { notified_count: overdueIssues.length };
  }

  /**
   * Check for unacknowledged policies and send reminders
   * This should be called by a scheduled job (cron)
   */
  async sendPolicyReminders(daysThreshold = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    // Get all active policies
    const policies = await db('policies')
      .where('deleted_at', null)
      .where('status', 'active')
      .select('*');

    for (const policy of policies) {
      // Find users who haven't acknowledged this policy
      const acknowledgedUserIds = await db('policy_acknowledgements')
        .where('policy_id', policy.id)
        .pluck('employee_id');

      const unacknowledgedUsers = await db('users')
        .where('is_active', true)
        .whereNotIn('id', acknowledgedUserIds.length > 0 ? acknowledgedUserIds : ['00000000-0000-0000-0000-000000000000'])
        .select('id');

      for (const user of unacknowledgedUsers) {
        // Check if already sent reminder recently
        const recentReminder = await db('notifications')
          .where('user_id', user.id)
          .where('type', 'policy_reminder')
          .where('created_at', '>', cutoffDate)
          .whereRaw("metadata->>'policy_id' = ?", [policy.id])
          .first();

        if (!recentReminder) {
          await this.createNotification({
            user_id: user.id,
            type: 'policy_reminder',
            message: `Please acknowledge the policy: "${policy.title}". This is required for compliance.`,
            metadata: { policy_id: policy.id },
          });
        }
      }
    }
  }

  /**
   * Send email notification if enabled for this type
   */
  private async sendEmailIfEnabled(userId: string, notificationType: string, message: string) {
    // Check notification preferences from settings
    const settings = await db('settings')
      .where('key', 'notification_preferences')
      .first();

    if (!settings || !settings.value) return;

    try {
      const preferences = JSON.parse(settings.value);
      const emailKey = `${notificationType}_email`;

      if (preferences[emailKey]) {
        // Get user email
        const user = await db('users').where('id', userId).select('email', 'name').first();
        if (user && user.email) {
          // TODO: Integrate with email service (nodemailer already installed)
          console.log(`Email notification to ${user.email}: ${message}`);
        }
      }
    } catch (e) {
      console.error('Error parsing notification preferences:', e);
    }
  }
}
