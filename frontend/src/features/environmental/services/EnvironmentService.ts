import type { EmissionFactor, ProductESGProfile, CarbonTransaction, EnvironmentalGoal } from '../types';

// Mock Data
const mockEmissionFactors: EmissionFactor[] = [
  { id: '1', category: 'Energy', activity: 'Electricity Grid', unit: 'kWh', co2e: 0.45, source: 'EPA 2023', year: 2023, status: 'active' },
  { id: '2', category: 'Transport', activity: 'Diesel Vehicle', unit: 'Liters', co2e: 2.68, source: 'DEFRA 2023', year: 2023, status: 'active' },
  { id: '3', category: 'Materials', activity: 'Steel Production', unit: 'kg', co2e: 1.85, source: 'IPCC', year: 2022, status: 'deprecated' },
];

const mockProductProfiles: ProductESGProfile[] = [
  { id: '1', productName: 'EcoWidget Pro', category: 'Electronics', carbonFootprint: 12.5, waterUsage: 450, recycledMaterial: 85, rating: 'A' },
  { id: '2', productName: 'Standard Widget', category: 'Electronics', carbonFootprint: 28.4, waterUsage: 890, recycledMaterial: 15, rating: 'C' },
  { id: '3', productName: 'Green Packaging', category: 'Packaging', carbonFootprint: 1.2, waterUsage: 12, recycledMaterial: 100, rating: 'A' },
];

const mockTransactions: CarbonTransaction[] = [
  { id: 'TX-001', date: '2023-10-12', type: 'emission', amount: 450, cost: 0, project: 'PO-2023-1054 (Steel Order)', status: 'completed', sourceModule: 'purchase' },
  { id: 'TX-002', date: '2023-11-05', type: 'emission', amount: 120, cost: 0, project: 'MO-8902 (Assembly)', status: 'completed', sourceModule: 'manufacturing' },
  { id: 'TX-003', date: '2023-12-01', type: 'emission', amount: 35, cost: 0, project: 'Fleet Log #FL-992', status: 'completed', sourceModule: 'fleet' },
  { id: 'TX-004', date: '2023-12-10', type: 'emission', amount: 15, cost: 0, project: 'EXP-1209 (Business Travel)', status: 'pending', sourceModule: 'expenses' },
  { id: 'TX-005', date: '2023-12-15', type: 'offset', amount: 500, cost: 12500, project: 'Amazon Reforestation', status: 'completed', sourceModule: 'manual' },
  { id: 'TX-006', date: '2023-12-20', type: 'tax', amount: 620, cost: 31000, project: 'Q4 Carbon Tax Liability', status: 'pending', sourceModule: 'manual' },
];

const mockGoals: EnvironmentalGoal[] = [
  { id: '1', title: 'Reduce Fleet Emissions', department: 'Logistics', targetDate: '2026-12-31', metric: 'tCO2e', targetValue: 500, currentValue: 390, unit: 't', status: 'on_track' },
  { id: '2', title: 'Cut Packaging Waste', department: 'Manufacturing', targetDate: '2026-09-30', metric: 'Waste %', targetValue: 120, currentValue: 98, unit: 't', status: 'on_track' },
  { id: '3', title: 'Office Energy Cut', department: 'Corporate', targetDate: '2026-06-30', metric: 'Energy %', targetValue: 80, currentValue: 80, unit: 't', status: 'achieved' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const EnvironmentService = {
  // Emission Factors
  getEmissionFactors: async (): Promise<EmissionFactor[]> => {
    await delay(500);
    return [...mockEmissionFactors];
  },
  
  // Product Profiles
  getProductProfiles: async (): Promise<ProductESGProfile[]> => {
    await delay(500);
    return [...mockProductProfiles];
  },

  // Carbon Transactions
  getCarbonTransactions: async (): Promise<CarbonTransaction[]> => {
    await delay(500);
    return [...mockTransactions];
  },

  // Goals
  getEnvironmentalGoals: async (): Promise<EnvironmentalGoal[]> => {
    await delay(500);
    return [...mockGoals];
  }
};
