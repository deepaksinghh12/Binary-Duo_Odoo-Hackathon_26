import { carbonTransactionsRepository } from './carbonTransactions.repository';
import { CreateCarbonTransactionInput } from './carbonTransactions.types';
import { validate } from '../../utils/validate';
import { createCarbonTransactionSchema } from './carbonTransactions.validation';
import { emissionFactorsRepository } from '../emissionFactors/emissionFactors.repository';
import { settingsService } from '../settings/settings.service';
import { NotFoundError, ValidationError, ForbiddenError } from '../../shared/errors';
import { cache } from '../../utils/cache';
import { UserRole } from '../../shared/types';

export const carbonTransactionsService = {
  async listTransactions(params: { 
    page: number; 
    limit: number; 
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    sourceType?: string;
  }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, Math.min(100, params.limit));
    const offset = (page - 1) * limit;

    const { data, total } = await carbonTransactionsRepository.findMany({ 
      limit, 
      offset,
      departmentId: params.departmentId,
      startDate: params.startDate,
      endDate: params.endDate,
      sourceType: params.sourceType
    });

    return {
      transactions: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async createTransaction(input: CreateCarbonTransactionInput, userRole: string, userId: string) {
    // Check auto_calculate_emissions setting
    const autoCalc = await settingsService.getSetting('auto_calculate_emissions');
    if (autoCalc?.value === 'true' && userRole !== 'admin') {
      throw new ForbiddenError('Manual carbon transaction entry is disabled by settings');
    }

    const payload = validate(createCarbonTransactionSchema, input);

    // Calculate co2e
    const factor = await emissionFactorsRepository.findById(payload.emission_factor_id);
    if (!factor) {
      throw new NotFoundError('Emission Factor');
    }

    const co2eCalculated = payload.quantity * Number(factor.co2e_factor);

    const recordPayload = {
      department_id: payload.department_id,
      activity_type: payload.activity_type,
      quantity: payload.quantity,
      emission_factor_id: payload.emission_factor_id,
      source_type: payload.source_type as any,
      source_record_id: payload.source_record_id || null,
      transaction_date: new Date(payload.transaction_date),
      created_by: userId,
      co2e_calculated: co2eCalculated
    };

    return carbonTransactionsRepository.create(recordPayload);
  },

  async getDashboardSummary(params: { departmentId?: string; startDate?: string; endDate?: string }) {
    const cacheKey = `carbonTransactions:summary:${params.departmentId || 'all'}:${params.startDate || 'all'}:${params.endDate || 'all'}`;
    
    try {
      const cached = await cache.get<any>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (err) {
      // Ignore cache error
    }

    const summary = await carbonTransactionsRepository.getDashboardSummary(
      params.departmentId,
      params.startDate,
      params.endDate
    );

    try {
      await cache.set(cacheKey, summary, 300000); // 5 mins cache in ms
    } catch (err) {
      // Ignore cache error
    }

    return summary;
  }
};
