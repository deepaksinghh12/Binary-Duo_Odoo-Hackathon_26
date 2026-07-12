import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export const EnvironmentalLayout: React.FC = () => {
  const tabs = [
    { label: 'Emission Factors', to: '/dashboard/environmental/emissions' },
    { label: 'Product ESG Profiles', to: '/dashboard/environmental/products' },
    { label: 'Carbon Transactions', to: '/dashboard/environmental/transactions' },
    { label: 'Environmental Goals', to: '/dashboard/environmental/goals' }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 overflow-x-auto custom-scrollbar shrink-0">
        <nav className="flex w-full min-w-max gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex-1 text-center px-5 py-2 text-sm font-bold transition-all duration-200 whitespace-nowrap rounded-xl ${
                  isActive
                    ? 'text-[#0D3B3E] bg-[#4CAF3A]/20 border border-[#4CAF3A]/30'
                    : 'text-slate-500 hover:text-[#0D3B3E] hover:bg-slate-50 border border-transparent'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};
