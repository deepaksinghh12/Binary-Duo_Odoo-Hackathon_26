import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  console.log('🌱 Starting Master Seed...');

  // 1. Clean existing data (in correct foreign key order)
  await knex('activity_log').del();
  await knex('challenge_participation').del();
  await knex('challenges').del();
  await knex('csr_activities').del();
  await knex('environmental_goals').del();
  await knex('carbon_transactions').del();
  await knex('policy_acknowledgements').del();
  await knex('policies').del();
  await knex('users').del();
  await knex('departments').del();
  await knex('categories').del();

  // 2. Seed Departments
  const deptIds = await knex('departments').insert([
    { name: 'Corporate', code: 'CORP', status: 'active', employee_count: 28 },
    { name: 'IT Security', code: 'ITS', status: 'active', employee_count: 21 },
    { name: 'Operations', code: 'OPS', status: 'active', employee_count: 154 }
  ]).returning('id');

  // 3. Seed Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const userIds = await knex('users').insert([
    { email: 'admin@ecosphere.com', password_hash: hashedPassword, name: 'Admin User', role: 'admin', department_id: deptIds[0].id, is_active: true },
    { email: 'manager@ecosphere.com', password_hash: hashedPassword, name: 'Manager User', role: 'manager', department_id: deptIds[1].id, is_active: true },
    { email: 'employee@ecosphere.com', password_hash: hashedPassword, name: 'Employee User', role: 'employee', department_id: deptIds[2].id, is_active: true }
  ]).returning('id');

  // 4. Seed Categories
  const categoryIds = await knex('categories').insert([
    { name: 'Environmental Awareness', type: 'challenge', status: 'active' },
    { name: 'Community Outreach', type: 'csr_activity', status: 'active' },
    { name: 'Carbon Footprint Reduction', type: 'challenge', status: 'active' }
  ]).returning('id');

  // 5. Seed Goals
  await knex('environmental_goals').insert([
    { target_metric: 'Reduce Fleet Emissions', department_id: deptIds[2].id, target_value: 500, current_progress: 390, target_date: '2026-12-31', status: 'on_track' },
    { target_metric: 'Office Energy Cut', department_id: deptIds[0].id, target_value: 80, current_progress: 80, target_date: '2026-06-30', status: 'achieved' }
  ]);

  // 5.5 Seed Emission Factor
  const efIds = await knex('emission_factors').insert([
    { name: 'Grid Electricity', activity_type: 'emission', unit: 'kWh', co2e_factor: 0.85, status: 'active' }
  ]).returning('id');

  // 6. Seed Carbon Transactions (Emissions over time)
  await knex('carbon_transactions').insert([
    { transaction_date: '2023-08-01', activity_type: 'emission', source_type: 'manual', quantity: 611, emission_factor_id: efIds[0].id, co2e_calculated: 520, department_id: deptIds[2].id, created_by: userIds[1].id },
    { transaction_date: '2023-09-01', activity_type: 'emission', source_type: 'manual', quantity: 576, emission_factor_id: efIds[0].id, co2e_calculated: 490, department_id: deptIds[2].id, created_by: userIds[1].id },
    { transaction_date: '2023-10-01', activity_type: 'emission', source_type: 'manual', quantity: 623, emission_factor_id: efIds[0].id, co2e_calculated: 530, department_id: deptIds[2].id, created_by: userIds[1].id },
    { transaction_date: '2023-11-01', activity_type: 'emission', source_type: 'manual', quantity: 564, emission_factor_id: efIds[0].id, co2e_calculated: 480, department_id: deptIds[2].id, created_by: userIds[1].id },
    { transaction_date: '2023-12-01', activity_type: 'emission', source_type: 'manual', quantity: 541, emission_factor_id: efIds[0].id, co2e_calculated: 460, department_id: deptIds[2].id, created_by: userIds[1].id },
    { transaction_date: '2024-01-01', activity_type: 'emission', source_type: 'manual', quantity: 517, emission_factor_id: efIds[0].id, co2e_calculated: 440, department_id: deptIds[2].id, created_by: userIds[1].id }
  ]);

  // 7. Seed Policies
  const policyIds = await knex('policies').insert([
    { title: 'Data Privacy v4.1', description: 'Guidelines for GDPR compliance', department_id: deptIds[1].id, status: 'active' },
    { title: 'Code of Conduct', description: 'Ethics and behavioral guidelines', department_id: deptIds[0].id, status: 'active' }
  ]).returning('id');

  // 8. Seed Policy Acknowledgements
  await knex('policy_acknowledgements').insert([
    { employee_id: userIds[2].id, policy_id: policyIds[0].id, acknowledged_at: new Date() }
  ]);

  // 9. Seed CSR Activities
  await knex('csr_activities').insert([
    { title: 'Tree Plantation Drive', description: 'Planting 1000 trees', category_id: categoryIds[1].id, status: 'evidence_required', joined_count: 24, department_id: deptIds[2].id, date: '2024-06-01', points_value: 50 },
    { title: 'Beach Cleanup', description: 'Cleaning local beach', category_id: categoryIds[1].id, status: 'open', joined_count: 31, department_id: deptIds[2].id, date: '2024-07-01', points_value: 100 }
  ]);

  // 10. Seed Challenges
  const challengeIds = await knex('challenges').insert([
    { title: 'Carbon Footprint Challenge', description: 'Reduce personal carbon footprint', category_id: categoryIds[0].id, xp_reward: 100, status: 'active', deadline: '2024-12-31 23:59:59' }
  ]).returning('id');

  // 11. Seed Challenge Participation
  await knex('challenge_participation').insert([
    { employee_id: userIds[2].id, challenge_id: challengeIds[0].id, approval_status: 'approved', completed_at: new Date(), xp_awarded: 100 }
  ]);

  // 12. Seed Activity Log (Recent Activities)
  await knex('activity_log').insert([
    { user_id: userIds[2].id, type: 'challenge_completion', message: 'Carbon Footprint Challenge completed — Employee User' },
    { user_id: userIds[0].id, type: 'policy_acknowledgement', message: 'Data Privacy v4.1 policy acknowledged' }
  ]);

  console.log('✅ Master Seed Completed Successfully!');
}
