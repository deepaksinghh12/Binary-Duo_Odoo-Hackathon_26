import { employeeParticipationRepository } from './employeeParticipation.repository';
import { CreateParticipationInput } from './employeeParticipation.types';
import { validate } from '../../utils/validate';
import { createParticipationSchema } from './employeeParticipation.validation';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors';
import { csrActivitiesRepository } from '../csrActivities/csrActivities.repository';
import { settingsService } from '../settings/settings.service';
import db from '../../database/knex';

export const employeeParticipationService = {
  async listParticipations(params: {
    page: number;
    limit: number;
    employeeId?: string;
    csrActivityId?: string;
    approvalStatus?: string;
  }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, Math.min(100, params.limit));
    const offset = (page - 1) * limit;

    const { data, total } = await employeeParticipationRepository.findMany({
      limit,
      offset,
      employeeId: params.employeeId,
      csrActivityId: params.csrActivityId,
      approvalStatus: params.approvalStatus,
    });

    return {
      participations: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async joinActivity(input: CreateParticipationInput, employeeId: string) {
    const payload = validate(createParticipationSchema, input);

    // Check if already joined
    const existing = await employeeParticipationRepository.findByEmployeeAndActivity(employeeId, payload.csr_activity_id);
    if (existing) {
      throw new BadRequestError('You have already joined this activity');
    }

    // Verify activity exists and is active
    const activity = await csrActivitiesRepository.findById(payload.csr_activity_id);
    if (!activity) throw new NotFoundError('CSR Activity');
    if (activity.status !== 'active') throw new BadRequestError('Cannot join an inactive or completed activity');

    // Resolve evidence requirement
    let evidenceRequired = activity.evidence_required;
    if (evidenceRequired === null) {
      const setting = await settingsService.getSetting('csr_evidence_required');
      evidenceRequired = setting?.value === 'true';
    }

    if (evidenceRequired && !payload.proof_url) {
      throw new BadRequestError('Proof of participation is required for this activity');
    }

    // Create participation and increment joined count atomically in a transaction
    return await db.transaction(async (trx) => {
      const [record] = await trx('employee_participation').insert({
        employee_id: employeeId,
        csr_activity_id: payload.csr_activity_id,
        proof_url: payload.proof_url || null,
        approval_status: 'pending',
        points_earned: 0,
        completion_date: null
      }).returning('*');

      await trx('csr_activities')
        .where({ id: activity.id })
        .increment('joined_count', 1);

      return record;
    });
  },

  async approveParticipation(id: string) {
    const participation = await employeeParticipationRepository.findById(id);
    if (!participation) throw new NotFoundError('Participation Record');
    if (participation.approval_status !== 'pending') throw new BadRequestError('Participation is not pending approval');

    const activity = await csrActivitiesRepository.findById(participation.csr_activity_id);
    if (!activity) throw new NotFoundError('CSR Activity');

    // Update status and award XP atomically
    return await db.transaction(async (trx) => {
      const [updated] = await trx('employee_participation')
        .where({ id })
        .update({
          approval_status: 'approved',
          points_earned: activity.points_value,
          completion_date: trx.fn.now(),
          updated_at: trx.fn.now()
        }).returning('*');

      await trx('users')
        .where({ id: participation.employee_id })
        .increment('xp_total', activity.points_value);

      // Notify the employee their CSR participation was approved
      await trx('notifications').insert({
        user_id: participation.employee_id,
        type: 'csr_approval',
        message: `Your participation in "${activity.title}" has been approved! You earned ${activity.points_value} XP.`,
        read: false,
      });

      // Log to activity feed
      const user = await trx('users')
        .where({ id: participation.employee_id })
        .select('name', 'department_id')
        .first();

      await trx('activity_log').insert({
        type: 'csr_participation',
        message: `${user?.name || 'An employee'} completed CSR activity: ${activity.title} (+${activity.points_value} XP)`,
        entity_type: 'csr_activity',
        entity_id: activity.id,
        department_id: user?.department_id || null,
        user_id: participation.employee_id,
      });

      return updated;
    });
  },

  async rejectParticipation(id: string) {
    const participation = await employeeParticipationRepository.findById(id);
    if (!participation) throw new NotFoundError('Participation Record');
    if (participation.approval_status !== 'pending') throw new BadRequestError('Participation is not pending approval');

    return employeeParticipationRepository.updateStatus(id, 'rejected', 0);
  }
};
