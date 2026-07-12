import { ChallengesRepository } from './challenges.repository';
import type { Challenge, CreateChallengeDto, UpdateChallengeDto, ChallengeFilters, ChallengeStatus } from './challenges.types';
import { isValidStatusTransition } from './challenges.types';

export class ChallengesService {
  private repository = new ChallengesRepository();

  async getAllChallenges(filters: ChallengeFilters) {
    return this.repository.findAll(filters);
  }

  async getChallengeById(id: string): Promise<Challenge> {
    const challenge = await this.repository.findById(id);
    if (!challenge) {
      throw new Error('Challenge not found');
    }
    return challenge;
  }

  async createChallenge(data: CreateChallengeDto): Promise<Challenge> {
    // Status defaults to 'draft' if not provided
    const challengeData = {
      ...data,
      status: data.status || ('draft' as ChallengeStatus),
    };

    return this.repository.create(challengeData);
  }

  async updateChallenge(id: string, data: UpdateChallengeDto): Promise<Challenge> {
    const existingChallenge = await this.repository.findById(id);
    if (!existingChallenge) {
      throw new Error('Challenge not found');
    }

    // If status is being updated, validate the transition
    if (data.status && data.status !== existingChallenge.status) {
      if (!isValidStatusTransition(existingChallenge.status, data.status)) {
        throw new Error(
          `Invalid status transition from '${existingChallenge.status}' to '${data.status}'`
        );
      }
    }

    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new Error('Failed to update challenge');
    }

    return updated;
  }

  async updateChallengeStatus(id: string, newStatus: ChallengeStatus): Promise<Challenge> {
    const existingChallenge = await this.repository.findById(id);
    if (!existingChallenge) {
      throw new Error('Challenge not found');
    }

      if (!isValidStatusTransition(existingChallenge.status, newStatus)) {
      throw new Error(
        `Invalid status transition from '${existingChallenge.status}' to '${newStatus}'.`
      );
    }

    const updated = await this.repository.update(id, { status: newStatus });
    if (!updated) {
      throw new Error('Failed to update challenge status');
    }

    return updated;
  }

  async deleteChallenge(id: string): Promise<void> {
    const challenge = await this.repository.findById(id);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const deleted = await this.repository.softDelete(id);
    if (!deleted) {
      throw new Error('Failed to delete challenge');
    }
  }
}
