export interface EmissionFactorRecord {
  id: string;
  name: string;
  activity_type: string;
  unit: string;
  co2e_factor: number;
  source: string | null;
  status: 'active' | 'inactive';
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEmissionFactorInput {
  name: string;
  activity_type: string;
  unit: string;
  co2e_factor: number;
  source?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateEmissionFactorInput {
  name?: string;
  activity_type?: string;
  unit?: string;
  co2e_factor?: number;
  source?: string;
  status?: 'active' | 'inactive';
}
