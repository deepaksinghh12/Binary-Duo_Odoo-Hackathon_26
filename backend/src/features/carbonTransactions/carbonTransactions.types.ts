export interface CarbonTransactionRecord {
  id: string;
  department_id: string;
  activity_type: string;
  quantity: number;
  emission_factor_id: string;
  co2e_calculated: number;
  source_type: 'purchase' | 'manufacturing' | 'expense' | 'fleet' | 'manual';
  source_record_id: string | null;
  transaction_date: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type CreateCarbonTransactionInput = {
  department_id: string;
  activity_type: string;
  quantity: number;
  emission_factor_id: string;
  source_type?: 'purchase' | 'manufacturing' | 'expense' | 'fleet' | 'manual';
  source_record_id?: string | null;
  transaction_date: string | Date;
};
