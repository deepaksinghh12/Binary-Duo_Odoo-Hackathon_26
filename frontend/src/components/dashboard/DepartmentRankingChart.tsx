import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { DepartmentRanking } from '../../types/dashboard.types';

interface DepartmentRankingChartProps {
  data: DepartmentRanking[];
  isLoading?: boolean;
}

export const DepartmentRankingChart: React.FC<DepartmentRankingChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[340px] flex flex-col">
        <div className="w-56 h-6 bg-slate-200 rounded mb-6 animate-pulse"></div>
        <div className="flex-1 bg-slate-50 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  // Calculate colors based on score
  const getColor = (score: number) => {
    if (score >= 85) return '#4CAF3A'; // Green
    if (score >= 75) return '#3b82f6'; // Blue
    return '#f59e0b'; // Amber
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[340px] flex flex-col">
      <h3 className="text-lg font-bold text-[#0D3B3E] mb-6">Department ESG Ranking</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="department" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} width={80} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
