import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  isSidebarCollapsed?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ to, label, icon, isSidebarCollapsed }) => {
  const location = useLocation();
  // Ensure precise matching for base /dashboard, but allow nested matching for others
  const isActive = to === '/dashboard' 
    ? location.pathname === '/dashboard'
    : location.pathname.startsWith(to);

  return (
    <li className="mb-1 list-none">
      <NavLink
        to={to}
        className={({ isActive }) => 
          `flex items-center ${isSidebarCollapsed ? 'gap-0' : 'gap-3'} rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${
            isActive 
              ? 'bg-[#4CAF3A]/10 text-[#4CAF3A] border border-[#4CAF3A]' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
          } ${isSidebarCollapsed ? 'w-12 h-12 justify-center p-0 mx-auto' : 'w-full px-4 py-2.5'}`
        }
        title={isSidebarCollapsed ? label : undefined}
      >
        {icon && (
          <span className={`text-xl shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
            {icon}
          </span>
        )}
        <span className={`transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'
        }`}>
          {label}
        </span>
      </NavLink>
    </li>
  );
};
