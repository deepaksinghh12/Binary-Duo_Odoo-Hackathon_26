import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export const SocialLayout: React.FC = () => {
  const tabs = [
    { label: 'CSR Activities', to: '/dashboard/social/csr' },
    { label: 'Employee Participation', to: '/dashboard/social/participation' },
    { label: 'Diversity Dashboard', to: '/dashboard/social/diversity' }
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-sm pt-2 pb-5 mb-1 -mt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 overflow-x-auto custom-scrollbar shrink-0">
        <nav className="flex w-full min-w-max gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to}
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
      <div className="flex-1 overflow-visible">
        <Outlet />
      </div>
    </div>
  );
};
