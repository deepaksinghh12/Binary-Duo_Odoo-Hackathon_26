import db from '../../database/knex';
import { SettingRecord } from './settings.types';

export const settingsRepository = {
  /**
   * Fetch a setting by its key.
   */
  async get(key: string): Promise<SettingRecord | undefined> {
    return db<SettingRecord>('settings').where({ key }).first();
  },

  /**
   * Upsert a setting key-value pair.
   */
  async set(key: string, value: string): Promise<SettingRecord> {
    const existing = await this.get(key);

    if (existing) {
      const [updated] = await db<SettingRecord>('settings')
        .where({ key })
        .update({ value, updated_at: new Date() })
        .returning('*');
      return updated;
    } else {
      const [inserted] = await db<SettingRecord>('settings')
        .insert({ key, value })
        .returning('*');
      return inserted;
    }
  },

  /**
   * Fetch all settings.
   */
  async getAll(): Promise<SettingRecord[]> {
    return db<SettingRecord>('settings').select('*');
  },
};
export default settingsRepository;
