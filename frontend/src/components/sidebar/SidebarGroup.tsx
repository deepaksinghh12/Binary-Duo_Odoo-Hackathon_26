import React, { useState } from 'react';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';

interface SidebarGroupProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  isSidebarCollapsed: boolean;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({ 
  title, 
  icon, 
  children, 
  defaultExpanded = true,
  isSidebarCollapsed
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4 relative group">
      <button 
        onClick={() => !isSidebarCollapsed && setIsExpanded(!isExpanded)}
        className={`flex items-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'w-12 h-12 justify-center p-0 mx-auto' : 'w-full px-4 py-2 justify-between'}`}
      >
        <div className={`flex items-center ${isSidebarCollapsed ? 'gap-0' : 'gap-3'}`}>
          {icon && <span className="text-xl opacity-70 group-hover:opacity-100 transition-opacity shrink-0">{icon}</span>}
          <span className={`font-semibold text-sm tracking-wide uppercase transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            {title}
          </span>
        </div>
        {!isSidebarCollapsed && (
          <div className="text-slate-500 shrink-0">
            {isExpanded ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
          </div>
        )}
      </button>
      
      {/* Expanded items */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${(!isSidebarCollapsed && isExpanded) ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        <ul className="pl-4 pr-2 space-y-1 list-none">
          {children}
        </ul>
      </div>

      {/* Tooltip on hover when collapsed */}
      {isSidebarCollapsed && (
        <div className="absolute left-full top-0 ml-2 hidden group-hover:block bg-slate-800 text-white text-sm px-3 py-2 rounded-md whitespace-nowrap z-50 shadow-lg">
          <div className="font-bold border-b border-slate-700 pb-1 mb-1">{title}</div>
          <div className="flex flex-col gap-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
