import React from 'react';
import { MdAdd, MdPlayArrow, MdInsertChart } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Log Carbon Data',
      icon: <MdAdd size={24} />,
      color: 'bg-[#4CAF3A] hover:bg-[#3f7628]',
      onClick: () => navigate('/dashboard/environmental/emissions')
    },
    {
      title: 'Start Challenge',
      icon: <MdPlayArrow size={24} />,
      color: 'bg-amber-500 hover:bg-amber-600',
      onClick: () => navigate('/dashboard/gamification/challenges')
    },
    {
      title: 'View Reports',
      icon: <MdInsertChart size={24} />,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => navigate('/dashboard/reports/summary')
    }
  ];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-[#0D3B3E] mb-4">Quick Actions</h3>
      <div className="flex flex-col gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-white ${action.color} transition-all duration-200 active:scale-95 shadow-md`}
          >
            <div className="bg-white/20 p-2 rounded-lg">
              {action.icon}
            </div>
            <span className="font-bold">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
