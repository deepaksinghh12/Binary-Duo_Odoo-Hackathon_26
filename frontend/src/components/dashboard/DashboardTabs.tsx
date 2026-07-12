import React from 'react';
import { NavLink } from 'react-router-dom';

export const DashboardTabs: React.FC = () => {
  const tabs = [
    { label: 'Overview', to: '/dashboard', end: true },
    { label: 'Environmental', to: '/dashboard/environmental' },
    { label: 'Social', to: '/dashboard/social' },
    { label: 'Governance', to: '/dashboard/governance' },
    { label: 'Gamification', to: '/dashboard/gamification' },
    { label: 'Reports', to: '/dashboard/reports' },
    { label: 'Settings', to: '/dashboard/settings' }
  ];

  return (
    <div className="pb-3 lg:pb-4 overflow-x-auto custom-scrollbar shrink-0">
      <nav className="flex w-full min-w-max gap-2 bg-white p-2 rounded-full border border-slate-200 shadow-sm">
        {tabs.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex-1 px-4 py-2.5 text-sm font-bold text-center transition-all duration-200 whitespace-nowrap rounded-full ${
                isActive
                  ? 'text-white bg-[#4CAF3A]'
                  : 'text-slate-500 hover:text-[#0D3B3E] hover:bg-slate-100'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
