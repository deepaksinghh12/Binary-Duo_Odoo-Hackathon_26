export interface EmissionFactor {
  id: string;
  category: string;
  activity: string;
  unit: string;
  co2e: number;
  source: string;
  year: number;
  status: 'active' | 'deprecated';
}

export interface ProductESGProfile {
  id: string;
  productName: string;
  category: string;
  carbonFootprint: number; // kg CO2e
  waterUsage: number; // Liters
  recycledMaterial: number; // %
  rating: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface CarbonTransaction {
  id: string;
  date: string;
  type: 'offset' | 'credit' | 'tax' | 'emission';
  sourceModule?: 'purchase' | 'manufacturing' | 'fleet' | 'expenses' | 'manual';
  amount: number; // tCO2e
  cost: number;
  project: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface EnvironmentalGoal {
  id: string;
  title: string;
  targetDate: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  department: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
}
