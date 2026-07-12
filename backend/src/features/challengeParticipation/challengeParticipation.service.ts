import db from '../../database/knex';
import { ChallengeParticipationRepository } from './challengeParticipation.repository';
import { BadgeCheckerService } from '../../shared/badgeChecker.service';
import { cacheDelPattern } from '../../config/redis';
import type {
  ChallengeParticipation,
  CreateParticipationDto,
  UpdateParticipationDto,
  ParticipationFilters,
} from './challengeParticipation.types';

export class ChallengeParticipationService {
  private repository = new ChallengeParticipationRepository();
  private badgeChecker = new BadgeCheckerService();

  async getAllParticipation(filters: ParticipationFilters) {
    return this.repository.findAll(filters);
  }

  async getParticipationById(id: string): Promise<ChallengeParticipation> {
    const participation = await this.repository.findById(id);
    if (!participation) {
      throw new Error('Participation record not found');
    }
    return participation;
  }

  async joinChallenge(employeeId: string, data: Omit<CreateParticipationDto, 'employee_id'>): Promise<ChallengeParticipation> {
    // Check if employee already joined this challenge
    const existing = await this.repository.findByEmployeeAndChallenge(employeeId, data.challenge_id);
    if (existing) {
      throw new Error('You have already joined this challenge');
    }

    // Get challenge details to check evidence requirement
    const challenge = await db('challenges')
      .where({ id: data.challenge_id, deleted_at: null })
      .first();

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.status !== 'active') {
      throw new Error('Challenge is not currently active');
    }

    // Check evidence requirement
    if (challenge.evidence_required && !data.proof_url) {
      throw new Error('This challenge requires proof of participation');
    }

    // Create participation record
    const participation = await this.repository.create({
      ...data,
      employee_id: employeeId,
      progress: data.progress || 0,
    });

    // Increment challenge participant count
    await db('challenges')
      .where({ id: data.challenge_id })
      .increment('participant_count', 1);

    // Log activity
    await this.logChallengeParticipation(employeeId, challenge.title);

    // Invalidate caches
    await cacheDelPattern('leaderboard:*');

    return participation;
  }

  async updateParticipation(id: string, employeeId: string, data: UpdateParticipationDto): Promise<ChallengeParticipation> {
    const participation = await this.repository.findById(id);
    if (!participation) {
      throw new Error('Participation record not found');
    }

    // Verify ownership
    if (participation.employee_id !== employeeId) {
      throw new Error('You can only update your own participation');
    }

    if (participation.approval_status !== 'pending') {
      throw new Error('Cannot update participation that has already been reviewed');
    }

    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new Error('Failed to update participation');
    }

    return updated;
  }

  async approveParticipation(id: string, approverId: string): Promise<ChallengeParticipation> {
    const participation = await this.repository.findById(id);
    if (!participation) {
      throw new Error('Participation record not found');
    }

    if (participation.approval_status !== 'pending') {
      throw new Error('Participation has already been reviewed');
    }

    // Get challenge XP reward
    const challenge = await db('challenges')
      .where({ id: participation.challenge_id })
      .select('xp_reward', 'title')
      .first();

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Update participation to approved
    const updated = await this.repository.updateApprovalStatus(id, 'approved', challenge.xp_reward);
    if (!updated) {
      throw new Error('Failed to approve participation');
    }

    // Award XP to employee and increment completed challenges count
    await db('users')
      .where({ id: participation.employee_id })
      .increment('xp_total', challenge.xp_reward)
      .increment('completed_challenges_count', 1);

    // Check and auto-award badges
    await this.badgeChecker.checkAndAwardBadges(participation.employee_id);

    // Create notification
    await this.createApprovalNotification(participation.employee_id, challenge.title, true, challenge.xp_reward);

    // Log activity
    await this.logChallengeCompletion(participation.employee_id, challenge.title, challenge.xp_reward);

    // Invalidate caches
    await cacheDelPattern('leaderboard:*');
    await cacheDelPattern('department-scores:*');

    return updated;
  }

  async rejectParticipation(id: string, approverId: string): Promise<ChallengeParticipation> {
    const participation = await this.repository.findById(id);
    if (!participation) {
      throw new Error('Participation record not found');
    }

    if (participation.approval_status !== 'pending') {
      throw new Error('Participation has already been reviewed');
    }

    // Update participation to rejected
    const updated = await this.repository.updateApprovalStatus(id, 'rejected', 0);
    if (!updated) {
      throw new Error('Failed to reject participation');
    }

    // Get challenge details for notification
    const challenge = await db('challenges')
      .where({ id: participation.challenge_id })
      .select('title')
      .first();

    // Create notification
    if (challenge) {
      await this.createApprovalNotification(participation.employee_id, challenge.title, false, 0);
    }

    return updated;
  }

  private async createApprovalNotification(
    employeeId: string,
    challengeTitle: string,
    approved: boolean,
    xpAwarded: number
  ): Promise<void> {
    const message = approved
      ? `Your participation in "${challengeTitle}" has been approved! You earned ${xpAwarded} XP.`
      : `Your participation in "${challengeTitle}" was not approved. Please review the requirements.`;

    await db('notifications').insert({
      user_id: employeeId,
      type: 'challenge_approval',
      message,
      read: false,
    });
  }

  private async logChallengeParticipation(employeeId: string, challengeTitle: string): Promise<void> {
    const user = await db('users').where({ id: employeeId }).select('department_id', 'name').first();

    await db('activity_log').insert({
      type: 'challenge_completion',
      message: `${user?.name || 'User'} joined challenge: ${challengeTitle}`,
      entity_type: 'challenge',
      department_id: user?.department_id || null,
      user_id: employeeId,
    });
  }

  private async logChallengeCompletion(employeeId: string, challengeTitle: string, xpAwarded: number): Promise<void> {
    const user = await db('users').where({ id: employeeId }).select('department_id', 'name').first();

    await db('activity_log').insert({
      type: 'challenge_completion',
      message: `${user?.name || 'User'} completed challenge: ${challengeTitle} (+${xpAwarded} XP)`,
      entity_type: 'challenge',
      department_id: user?.department_id || null,
      user_id: employeeId,
    });
  }
}
