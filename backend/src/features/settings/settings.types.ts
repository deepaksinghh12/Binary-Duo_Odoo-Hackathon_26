export interface SettingRecord {
  key: string;
  value: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateSettingInput {
  key: string;
  value: string;
}
