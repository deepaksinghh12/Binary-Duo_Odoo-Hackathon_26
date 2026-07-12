import React, { useState, useEffect } from 'react';
import { MdPieChart, MdTrendingUp, MdTrendingDown, MdTrendingFlat, MdSupervisedUserCircle } from 'react-icons/md';
import { SocialService } from '../services/SocialService';
import type { DiversityMetric } from '../types';

export const DiversityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DiversityMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await SocialService.getDiversityMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to load diversity metrics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <MdTrendingUp size={16} className="text-emerald-500" />;
      case 'down': return <MdTrendingDown size={16} className="text-red-500" />;
      case 'flat': return <MdTrendingFlat size={16} className="text-slate-400" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Gender': return 'from-purple-500 to-fuchsia-500 text-purple-600 bg-purple-50';
      case 'Pay Equity': return 'from-emerald-500 to-teal-500 text-emerald-600 bg-emerald-50';
      case 'Age': return 'from-blue-500 to-cyan-500 text-blue-600 bg-blue-50';
      default: return 'from-slate-500 to-slate-400 text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-8">
      <div className="bg-[#0D3B3E] rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 scale-150 -translate-y-1/4 translate-x-1/4">
          <MdSupervisedUserCircle size={200} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-3">Diversity & Inclusion Dashboard</h2>
          <p className="text-blue-100">Track our progress towards a more equitable and diverse workplace. These metrics are updated quarterly based on HR data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl animate-pulse"></div>)
        ) : (
          metrics.map(metric => {
            const colors = getCategoryColor(metric.category);
            const isPayGap = metric.category === 'Pay Equity';
            return (
              <div key={metric.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-md hover:border-slate-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${colors.split(' ')[2]} ${colors.split(' ')[3]}`}>
                    {metric.category}
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded-full group-hover:scale-110 transition-transform">
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-slate-800 mb-1">{metric.value}{isPayGap ? '%' : '%'}</h4>
                  <p className="text-sm font-medium text-slate-500 leading-snug">{metric.label}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-center items-center min-h-[300px]">
          <MdPieChart size={64} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Workforce Demographics</h3>
          <p className="text-slate-500 text-sm text-center max-w-sm">Detailed charts and breakdowns will be available in the upcoming Q3 Diversity Report module.</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-center items-center min-h-[300px]">
          <MdPieChart size={64} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Management Distribution</h3>
          <p className="text-slate-500 text-sm text-center max-w-sm">Detailed charts and breakdowns will be available in the upcoming Q3 Diversity Report module.</p>
        </div>
      </div>
    </div>
  );
};
