import React from 'react';
import type { Activity } from '../../types/dashboard.types';
import { MdEco, MdEmojiEvents, MdGavel, MdPeople } from 'react-icons/md';

interface RecentActivityProps {
  activities: Activity[];
  isLoading?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
        <div className="w-40 h-6 bg-slate-200 rounded mb-6 animate-pulse"></div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0"></div>
              <div className="flex-1">
                <div className="w-32 h-4 bg-slate-200 rounded mb-2"></div>
                <div className="w-full h-3 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'carbon': return <MdEco className="text-[#4CAF3A]" />;
      case 'challenge': return <MdEmojiEvents className="text-amber-500" />;
      case 'policy': return <MdGavel className="text-indigo-500" />;
      case 'csr': return <MdPeople className="text-blue-500" />;
      default: return <MdEco className="text-slate-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'carbon': return 'bg-[#4CAF3A]/10';
      case 'challenge': return 'bg-amber-500/10';
      case 'policy': return 'bg-indigo-500/10';
      case 'csr': return 'bg-blue-500/10';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
      <h3 className="text-lg font-bold text-[#0D3B3E] mb-6">Recent Activity</h3>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
        {activities.map((activity) => (
          <div key={activity.id} className="relative flex items-center gap-6">
            {/* Timeline dot */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getBgColor(activity.type)} border-4 border-white shrink-0 shadow-sm relative z-10`}>
              {getIcon(activity.type)}
            </div>
            
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-[#0D3B3E] text-sm">{activity.title}</h4>
                <span className="text-xs text-slate-400 font-medium shrink-0 ml-4">{activity.timestamp}</span>
              </div>
              <p className="text-slate-500 text-sm mb-0">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
