import db from '../../database/knex';

export const socialMetricsService = {
  async getDiversityMetrics() {
    // This is a minimal read model querying the users table.
    // Assuming users have a 'department_id' and 'role', we can aggregate.
    // Further attributes (like gender/ethnicity) would require schema changes if needed later.

    const metrics = await db('users')
      .select('department_id')
      .count('* as count')
      .groupBy('department_id');

    return {
      departmentBreakdown: metrics
    };
  },

  async getTrainingMetrics() {
    // Minimal read model placeholder.
    // To track actual "training modules" we would need a Training table.
    // For now, we will return a stub or derive from CSR activities categorized as 'training'.

    const trainingActivities = await db('csr_activities')
      .join('employee_participation', 'csr_activities.id', 'employee_participation.csr_activity_id')
      .join('categories', 'csr_activities.category_id', 'categories.id')
      .where('categories.name', 'ilike', '%training%')
      .select(
        'csr_activities.id', 
        'csr_activities.title', 
        'employee_participation.approval_status'
      )
      .count('employee_participation.id as participants')
      .groupBy('csr_activities.id', 'csr_activities.title', 'employee_participation.approval_status');

    return {
      trainingParticipation: trainingActivities
    };
  }
};
