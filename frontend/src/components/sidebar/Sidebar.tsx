import React from 'react';
import { NavLink } from 'react-router-dom';
import { SidebarGroup } from './SidebarGroup';
import { SidebarItem } from './SidebarItem';
import { 
  MdDashboard, 
  MdEco, 
  MdPeople, 
  MdGavel, 
  MdEmojiEvents, 
  MdBarChart, 
  MdSettings,
  MdMenu,
  MdMenuOpen
} from 'react-icons/md';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse }) => {
  return (
    <div 
      className={`h-screen bg-[#0D3B3E] text-slate-300 flex flex-col transition-all duration-300 relative z-20 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Sidebar Header (Logo) */}
      <div 
        className={`h-16 flex items-center border-b border-white/10 shrink-0 transition-all ${isCollapsed ? 'justify-center cursor-pointer hover:bg-white/5' : 'justify-between px-4'}`}
        onClick={isCollapsed ? toggleCollapse : undefined}
        title={isCollapsed ? "Expand Sidebar" : undefined}
      >
        <NavLink 
          to="/dashboard" 
          onClick={(e) => isCollapsed && e.preventDefault()} 
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="w-8 h-8 rounded flex items-center justify-center shrink-0">
            <img src="/favicon.svg" alt="EcoSphere Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-white tracking-wide whitespace-nowrap">
              EcoSphere
            </span>
          )}
        </NavLink>
        
        {!isCollapsed && (
          <button 
            onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
            className="flex text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          >
            <MdMenu size={24} />
          </button>
        )}
      </div>

      {/* Sidebar Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 custom-scrollbar">
        
        {/* Main Dashboard Link */}
        <SidebarItem 
          to="/dashboard" 
          label="Dashboard" 
          icon={<MdDashboard />} 
          isSidebarCollapsed={isCollapsed} 
        />

        <div className="my-4 border-t border-white/5"></div>

        <SidebarGroup title="Environmental" icon={<MdEco />} isSidebarCollapsed={isCollapsed}>
          <SidebarItem to="/dashboard/environmental/emissions" label="Emission Factors" />
          <SidebarItem to="/dashboard/environmental/products" label="Product ESG Profiles" />
          <SidebarItem to="/dashboard/environmental/transactions" label="Carbon Transactions" />
          <SidebarItem to="/dashboard/environmental/goals" label="Environmental Goals" />
        </SidebarGroup>

        <SidebarGroup title="Social" icon={<MdPeople />} isSidebarCollapsed={isCollapsed} defaultExpanded={false}>
          <SidebarItem to="/dashboard/social/csr" label="CSR Activities" />
          <SidebarItem to="/dashboard/social/participation" label="Employee Participation" />
          <SidebarItem to="/dashboard/social/diversity" label="Diversity Dashboard" />
        </SidebarGroup>

        <SidebarGroup title="Governance" icon={<MdGavel />} isSidebarCollapsed={isCollapsed} defaultExpanded={false}>
          <SidebarItem to="/dashboard/governance/policies" label="Policies" />
          <SidebarItem to="/dashboard/governance/acknowledgements" label="Policy Acknowledgements" />
          <SidebarItem to="/dashboard/governance/audits" label="Audits" />
          <SidebarItem to="/dashboard/governance/compliance" label="Compliance Issues" />
        </SidebarGroup>

        <SidebarGroup title="Gamification" icon={<MdEmojiEvents />} isSidebarCollapsed={isCollapsed} defaultExpanded={false}>
          <SidebarItem to="/dashboard/gamification/challenges" label="Challenges" />
          <SidebarItem to="/dashboard/gamification/participation" label="Challenge Participation" />
          <SidebarItem to="/dashboard/gamification/badges" label="Badges" />
          <SidebarItem to="/dashboard/gamification/rewards" label="Rewards" />
          <SidebarItem to="/dashboard/gamification/leaderboard" label="Leaderboard" />
        </SidebarGroup>

        <SidebarGroup title="Reports" icon={<MdBarChart />} isSidebarCollapsed={isCollapsed} defaultExpanded={false}>
          <SidebarItem to="/dashboard/reports/environmental" label="Environmental Report" />
          <SidebarItem to="/dashboard/reports/social" label="Social Report" />
          <SidebarItem to="/dashboard/reports/governance" label="Governance Report" />
          <SidebarItem to="/dashboard/reports/summary" label="ESG Summary" />
          <SidebarItem to="/dashboard/reports/builder" label="Custom Report Builder" />
        </SidebarGroup>

        <SidebarGroup title="Settings" icon={<MdSettings />} isSidebarCollapsed={isCollapsed} defaultExpanded={false}>
          <SidebarItem to="/dashboard/settings/departments" label="Departments" />
          <SidebarItem to="/dashboard/settings/categories" label="Categories" />
          <SidebarItem to="/dashboard/settings/esg" label="ESG Configuration" />
          <SidebarItem to="/dashboard/settings/notifications" label="Notification Settings" />
        </SidebarGroup>

      </div>
    </div>
  );
};
