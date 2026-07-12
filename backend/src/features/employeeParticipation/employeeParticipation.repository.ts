import db from '../../database/knex';
import { EmployeeParticipationRecord } from './employeeParticipation.types';

const TABLE_NAME = 'employee_participation';

export const employeeParticipationRepository = {
  async findMany(options: {
    limit: number;
    offset: number;
    employeeId?: string;
    csrActivityId?: string;
    approvalStatus?: string;
  }): Promise<{ data: EmployeeParticipationRecord[]; total: number }> {
    const query = db(TABLE_NAME);

    if (options.employeeId) query.where('employee_id', options.employeeId);
    if (options.csrActivityId) query.where('csr_activity_id', options.csrActivityId);
    if (options.approvalStatus) query.where('approval_status', options.approvalStatus);

    const totalRes = await query.clone().count({ count: '*' }).first();
    const total = Number(totalRes?.count || 0);

    const data = await query
      .select('*')
      .limit(options.limit)
      .offset(options.offset)
      .orderBy('created_at', 'desc');

    return { data, total };
  },

  async findById(id: string): Promise<EmployeeParticipationRecord | undefined> {
    return db(TABLE_NAME).where({ id }).first();
  },

  async findByEmployeeAndActivity(employeeId: string, activityId: string): Promise<EmployeeParticipationRecord | undefined> {
    return db(TABLE_NAME).where({ employee_id: employeeId, csr_activity_id: activityId }).first();
  },

  async create(data: Omit<EmployeeParticipationRecord, 'id' | 'created_at' | 'updated_at'>): Promise<EmployeeParticipationRecord> {
    const [record] = await db(TABLE_NAME).insert(data).returning('*');
    return record;
  },

  async updateStatus(
    id: string, 
    status: 'pending' | 'approved' | 'rejected',
    pointsEarned: number = 0
  ): Promise<EmployeeParticipationRecord> {
    const updateData: any = { 
      approval_status: status, 
      points_earned: pointsEarned,
      updated_at: db.fn.now() 
    };

    if (status === 'approved') {
      updateData.completion_date = db.fn.now();
    }

    const [record] = await db(TABLE_NAME)
      .where({ id })
      .update(updateData)
      .returning('*');
    return record;
  },
};
