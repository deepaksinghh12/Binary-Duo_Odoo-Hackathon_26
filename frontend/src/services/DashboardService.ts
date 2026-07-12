import axios from 'axios';
import type { 
  SummaryResponse, 
  EmissionTrendResponse, 
  DepartmentRankingResponse, 
  RecentActivityResponse, 
  QuickActionResponse 
} from '../types/dashboard.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const DashboardService = {
  getSummary: async (): Promise<{ data: { success: boolean; data: SummaryResponse } }> => {
    return api.get('/dashboard/summary');
  },

  getEmissionTrend: async (): Promise<{ data: { success: boolean; data: EmissionTrendResponse[] } }> => {
    return api.get('/dashboard/emission-trend');
  },

  getDepartmentRanking: async (): Promise<{ data: { success: boolean; data: DepartmentRankingResponse[] } }> => {
    return api.get('/dashboard/department-ranking');
  },

  getRecentActivities: async (): Promise<{ data: { success: boolean; data: RecentActivityResponse[] } }> => {
    return api.get('/dashboard/recent-activities');
  },

  getQuickActions: async (): Promise<{ data: { success: boolean; data: QuickActionResponse[] } }> => {
    return api.get('/dashboard/quick-actions');
  }
};
