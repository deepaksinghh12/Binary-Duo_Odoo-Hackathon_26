import { settingsRepository } from './settings.repository';
import { SettingRecord } from './settings.types';
import { validate } from '../../utils/validate';
import { updateSettingSchema } from './settings.validation';
import { NotFoundError } from '../../shared/errors';

export const settingsService = {
  /**
   * Retrieve a setting record by its key.
   */
  async getSetting(key: string): Promise<SettingRecord> {
    const record = await settingsRepository.get(key);
    if (!record) {
      throw new NotFoundError(`Setting key '${key}'`);
    }
    return record;
  },

  /**
   * Update or create a setting.
   */
  async updateSetting(key: string, value: string): Promise<SettingRecord> {
    validate(updateSettingSchema, { key, value });
    return settingsRepository.set(key, value);
  },

  /**
   * Get all setting records.
   */
  async listSettings(): Promise<SettingRecord[]> {
    return settingsRepository.getAll();
  },

  /**
   * Helper: Returns whether auto emissions calculation is active.
   */
  async getAutoCalculateToggle(): Promise<boolean> {
    const record = await settingsRepository.get('auto_calculate_emissions');
    return record?.value === 'true';
  },
};
export default settingsService;
