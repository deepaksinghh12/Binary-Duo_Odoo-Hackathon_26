import { environmentalGoalsRepository } from './environmentalGoals.repository';
import { EnvironmentalGoalRecord, CreateEnvironmentalGoalInput, UpdateEnvironmentalGoalInput } from './environmentalGoals.types';
import { validate } from '../../utils/validate';
import { createEnvironmentalGoalSchema, updateEnvironmentalGoalSchema } from './environmentalGoals.validation';
import { NotFoundError } from '../../shared/errors';

export const environmentalGoalsService = {
  /**
   * Helper: Map goal record and calculate dynamic progress/status
   */
  mapGoalProgress(goal: any) {
    const currentCO2 = Number(goal.currentCO2 ?? 0);
    const targetValue = Number(goal.target_value ?? 1);
    
    // progressPercent = (currentCO2 / targetValue) * 100
    // Capped at 100%
    const progressPercent = Math.min(100, Number(((currentCO2 / targetValue) * 100).toFixed(1)));

    // Derived Status rules:
    // 1. achieved: progress reaches 100%
    // 2. failed: deadline passed and progress is < 100%
    // 3. active: deadline is in the future
    let derivedStatus = goal.status;
    const now = new Date();
    const targetDate = new Date(goal.target_date);
    const createdAt = new Date(goal.created_at);

    if (progressPercent >= 100) {
      derivedStatus = 'achieved';
    } else if (targetDate < now) {
      derivedStatus = 'failed';
    } else {
      derivedStatus = 'active';
    }

    return {
      ...goal,
      currentCO2,
      progressPercent,
      status: derivedStatus,
    };
  },

  /**
   * List goals with pagination.
   */
  async listGoals(params: { page: number; limit: number; departmentId?: string }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, Math.min(100, params.limit));
    const offset = (page - 1) * limit;

    const { data, total } = await environmentalGoalsRepository.findMany({
      limit,
      offset,
      departmentId: params.departmentId,
    });

    const mappedGoals = data.map((g) => this.mapGoalProgress(g));

    return {
      goals: mappedGoals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get single environmental goal with dynamic metrics.
   */
  async getGoal(id: string) {
    const goal = await environmentalGoalsRepository.findById(id);
    if (!goal) {
      throw new NotFoundError('Environmental Goal');
    }
    return this.mapGoalProgress(goal);
  },

  /**
   * Create environmental goal.
   */
  async createGoal(input: CreateEnvironmentalGoalInput): Promise<EnvironmentalGoalRecord> {
    const payload = validate(createEnvironmentalGoalSchema, input);
    return environmentalGoalsRepository.create(payload);
  },

  /**
   * Update environmental goal.
   */
  async updateGoal(id: string, input: UpdateEnvironmentalGoalInput): Promise<EnvironmentalGoalRecord> {
    const goal = await this.getGoal(id); // Throws if not found
    const payload = validate(updateEnvironmentalGoalSchema, input);
    return environmentalGoalsRepository.update(goal.id, payload);
  },

  /**
   * Soft-delete goal.
   */
  async deleteGoal(id: string): Promise<void> {
    const goal = await this.getGoal(id);
    await environmentalGoalsRepository.softDelete(goal.id);
  },
};
export default environmentalGoalsService;
