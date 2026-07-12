import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Insert settings for gamification and notifications
  await knex('settings').insert([
    {
      key: 'badge_auto_award_enabled',
      value: 'true',
      description: 'Automatically award badges when unlock criteria are met',
    },
    {
      key: 'esg_weights',
      value: JSON.stringify({ environmental: 40, social: 30, governance: 30 }),
      description: 'Weights for ESG score calculation (must sum to 100)',
    },
    {
      key: 'notification_preferences',
      value: JSON.stringify({
        compliance_issue_email: true,
        csr_approval_email: false,
        challenge_approval_email: false,
        policy_reminder_email: true,
        badge_unlock_email: false,
        compliance_overdue_email: true,
      }),
      description: 'Email notification preferences by type',
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex('settings')
    .whereIn('key', ['badge_auto_award_enabled', 'esg_weights', 'notification_preferences'])
    .delete();
}
