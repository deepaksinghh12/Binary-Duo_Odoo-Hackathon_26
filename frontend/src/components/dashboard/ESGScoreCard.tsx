import React from 'react';

interface ESGScoreCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'indigo' | 'amber';
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

const colorMap = {
  green: { bg: 'bg-[#4CAF3A]/10', text: 'text-[#4CAF3A]', border: 'border-[#4CAF3A]/20', progress: 'bg-[#4CAF3A]' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', progress: 'bg-blue-500' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/20', progress: 'bg-indigo-500' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', progress: 'bg-amber-500' },
};

export const ESGScoreCard: React.FC<ESGScoreCardProps> = ({ title, score, icon, color, trend, isLoading }) => {
  const styles = colorMap[color];

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-pulse min-h-[180px] flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
          <div className="w-16 h-8 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="w-32 h-4 bg-slate-200 rounded mb-2"></div>
        <div className="w-full h-2 bg-slate-100 rounded-full mt-4">
          <div className="w-0 h-full bg-slate-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group min-h-[180px] flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-14 h-14 ${styles.bg} ${styles.text} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="text-right">
          <div className={`text-3xl font-extrabold ${styles.text}`}>
            {score}<span className="text-lg text-slate-400">/100</span>
          </div>
          {trend && (
            <div className={`text-xs font-bold mt-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
              {trend === 'up' ? '▲ +2.4%' : trend === 'down' ? '▼ -1.2%' : '▶ No change'}
            </div>
          )}
        </div>
      </div>
      
      <h3 className="text-slate-600 font-bold text-lg mb-4">{title}</h3>
      
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${styles.progress} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};
