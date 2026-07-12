import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EmissionData } from '../../types/dashboard.types';

interface EmissionTrendChartProps {
  data: EmissionData[];
  isLoading?: boolean;
}

export const EmissionTrendChart: React.FC<EmissionTrendChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[340px] flex flex-col">
        <div className="w-48 h-6 bg-slate-200 rounded mb-6 animate-pulse"></div>
        <div className="flex-1 bg-slate-50 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[340px] flex flex-col">
      <h3 className="text-lg font-bold text-[#0D3B3E] mb-6">Emission Trend</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend 
              content={(props) => {
                const { payload } = props;
                return (
                  <ul className="flex justify-center gap-6 text-xs pt-4">
                    {payload?.map((entry, index) => (
                      <li key={`item-${index}`} className="flex items-center text-slate-600 font-medium">
                        <span className="relative flex h-2 w-2 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4CAF3A] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4CAF3A]"></span>
                        </span>
                        {entry.value}
                      </li>
                    ))}
                  </ul>
                );
              }}
            />
            <Line type="monotone" name="Actual Emissions" dataKey="emissions" stroke="#4CAF3A" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
