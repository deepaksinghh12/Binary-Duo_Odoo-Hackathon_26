import { api } from '../../../services/api';
import type { EmissionFactor, ProductESGProfile, CarbonTransaction, EnvironmentalGoal } from '../types';

// ── Rich mock fallbacks (shown when DB is empty) ─────────────────────────────

const MOCK_EMISSION_FACTORS: EmissionFactor[] = [
  { id: '1', category: 'Energy',     activity: 'Electricity Grid',  unit: 'kWh',    co2e: 0.45, source: 'EPA 2023',   year: 2023, status: 'active' },
  { id: '2', category: 'Transport',  activity: 'Diesel Vehicle',    unit: 'Liters', co2e: 2.68, source: 'DEFRA 2023', year: 2023, status: 'active' },
  { id: '3', category: 'Materials',  activity: 'Steel Production',  unit: 'kg',     co2e: 1.85, source: 'IPCC',       year: 2022, status: 'deprecated' },
  { id: '4', category: 'Transport',  activity: 'Air Travel',        unit: 'km',     co2e: 0.25, source: 'DEFRA 2023', year: 2023, status: 'active' },
  { id: '5', category: 'Energy',     activity: 'Natural Gas',       unit: 'm³',     co2e: 2.04, source: 'EPA 2023',   year: 2023, status: 'active' },
  { id: '6', category: 'Materials',  activity: 'Plastic (Virgin)',  unit: 'kg',     co2e: 6.00, source: 'IPCC',       year: 2022, status: 'active' },
];

const MOCK_PRODUCT_PROFILES: ProductESGProfile[] = [
  { id: '1', productName: 'EcoWidget Pro',     category: 'Electronics', carbonFootprint: 12.5, waterUsage: 450,  recycledMaterial: 85,  rating: 'A' },
  { id: '2', productName: 'Standard Widget',   category: 'Electronics', carbonFootprint: 28.4, waterUsage: 890,  recycledMaterial: 15,  rating: 'C' },
  { id: '3', productName: 'Green Packaging',   category: 'Packaging',   carbonFootprint:  1.2, waterUsage:  12,  recycledMaterial: 100, rating: 'A' },
  { id: '4', productName: 'Industrial Motor',  category: 'Machinery',   carbonFootprint: 55.0, waterUsage: 1200, recycledMaterial: 40,  rating: 'B' },
  { id: '5', productName: 'BioPlastic Tray',   category: 'Packaging',   carbonFootprint:  3.1, waterUsage:  30,  recycledMaterial: 90,  rating: 'A' },
];

const MOCK_TRANSACTIONS: CarbonTransaction[] = [
  { id: 'TX-001', date: '2023-10-12', type: 'emission', amount: 450, cost: 0,      project: 'PO-2023-1054 (Steel Order)',    status: 'completed', sourceModule: 'manual' },
  { id: 'TX-002', date: '2023-12-01', type: 'offset',   amount: 500, cost: 12500,  project: 'Amazon Reforestation Credit',    status: 'completed', sourceModule: 'manual' },
  { id: 'TX-003', date: '2023-12-20', type: 'tax',      amount: 620, cost: 31000,  project: 'Q4 Carbon Tax Liability',        status: 'pending',   sourceModule: 'manual' },
  { id: 'TX-004', date: '2024-01-10', type: 'credit',   amount: 200, cost: 4000,   project: 'Solar Farm Credit (GoGreen)',    status: 'completed', sourceModule: 'manual' },
];

const MOCK_GOALS: EnvironmentalGoal[] = [
  { id: '1', title: 'Reduce Fleet Emissions',  department: 'Logistics',      targetDate: '2026-12-31', metric: 'tCO2e',    targetValue: 500, currentValue: 390, unit: 't', status: 'on_track' },
  { id: '2', title: 'Cut Packaging Waste',     department: 'Manufacturing',  targetDate: '2026-09-30', metric: 'Waste %',  targetValue: 120, currentValue: 98,  unit: 't', status: 'on_track' },
  { id: '3', title: 'Office Energy Cut',       department: 'Corporate',      targetDate: '2026-06-30', metric: 'Energy %', targetValue: 80,  currentValue: 80,  unit: 't', status: 'achieved' },
  { id: '4', title: 'Water Usage Reduction',   department: 'Manufacturing',  targetDate: '2026-12-31', metric: 'kL',       targetValue: 1000, currentValue: 420, unit: 'kL', status: 'at_risk' },
];

// ── Service ───────────────────────────────────────────────────────────────────

export const EnvironmentService = {
  getEmissionFactors: async (): Promise<EmissionFactor[]> => {
    try {
      const res = await api.get('/emission-factors');
      const raw: any[] = res.data?.data?.factors || res.data?.data || [];
      if (!raw.length) return MOCK_EMISSION_FACTORS;
      return raw.map(f => ({
        id: f.id,
        category: f.activity_type || 'Energy',
        activity: f.name || f.activity_type,
        unit: f.unit,
        co2e: Number(f.co2e_factor),
        source: f.source || 'EPA 2023',
        year: f.created_at ? new Date(f.created_at).getFullYear() : 2023,
        status: f.status === 'active' ? 'active' : 'deprecated',
      }));
    } catch {
      return MOCK_EMISSION_FACTORS;
    }
  },

  getProductProfiles: async (): Promise<ProductESGProfile[]> => {
    try {
      const res = await api.get('/product-esg-profiles');
      const raw: any[] = res.data?.data?.profiles || res.data?.data || [];
      if (!raw.length) return MOCK_PRODUCT_PROFILES;
      return raw.map(p => {
        let extras = { carbonFootprint: 12.5, waterUsage: 450, recycledMaterial: 85, rating: 'A' as any };
        if (p.notes) {
          try { extras = { ...extras, ...JSON.parse(p.notes) }; } catch {}
        }
        return {
          id: p.id,
          productName: p.product_name,
          category: p.category_name || 'Electronics',
          ...extras,
        };
      });
    } catch {
      return MOCK_PRODUCT_PROFILES;
    }
  },

  getCarbonTransactions: async (): Promise<CarbonTransaction[]> => {
    try {
      const res = await api.get('/carbon-transactions');
      const raw: any[] = res.data?.data?.transactions || res.data?.data || [];
      if (!raw.length) return MOCK_TRANSACTIONS;
      return raw.map(tx => ({
        id: tx.id,
        date: tx.transaction_date ? new Date(tx.transaction_date).toISOString().split('T')[0] : '',
        type: tx.activity_type || 'emission',
        sourceModule: tx.source_type || 'manual',
        amount: Number(tx.co2e_calculated),
        cost: Number(tx.cost || 0),
        project: tx.department_name || 'Entity',
        status: 'completed',
      }));
    } catch {
      return MOCK_TRANSACTIONS;
    }
  },

  getEnvironmentalGoals: async (): Promise<EnvironmentalGoal[]> => {
    try {
      const res = await api.get('/environmental-goals');
      const raw: any[] = res.data?.data?.goals || res.data?.data || [];
      if (!raw.length) return MOCK_GOALS;
      return raw.map(g => ({
        id: g.id,
        title: g.target_metric || 'Sustainability Goal',
        department: g.department_name || 'Operations',
        targetDate: g.target_date ? new Date(g.target_date).toISOString().split('T')[0] : '',
        metric: g.target_metric || 'CO2 Reduction',
        targetValue: Number(g.target_value),
        currentValue: Number(g.current_progress),
        unit: 't',
        status: g.status || 'on_track',
      }));
    } catch {
      return MOCK_GOALS;
    }
  },
};
