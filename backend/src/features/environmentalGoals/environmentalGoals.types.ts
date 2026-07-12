export interface EnvironmentalGoalRecord {
  id: string;
  department_id: string;
  target_metric: string;
  target_value: number;
  target_date: Date;
  current_progress: number;
  status: 'active' | 'achieved' | 'failed';
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEnvironmentalGoalInput {
  department_id: string;
  target_metric: string;
  target_value: number;
  target_date: Date;
  current_progress?: number;
  status?: 'active' | 'achieved' | 'failed';
}

export interface UpdateEnvironmentalGoalInput {
  department_id?: string;
  target_metric?: string;
  target_value?: number;
  target_date?: Date;
  current_progress?: number;
  status?: 'active' | 'achieved' | 'failed';
}
