import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/sidebar/Sidebar';
import { TopNavbar } from '../components/navbar/TopNavbar';
import { DashboardTabs } from '../components/dashboard/DashboardTabs';

export const DashboardLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Desktop and Mobile wrapper */}
      <div className={`transition-all duration-300 z-30 ${isSidebarCollapsed ? '-ml-20 md:ml-0' : 'ml-0'
        }`}>
        <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full min-w-0 transition-all duration-300">
        <TopNavbar toggleSidebar={toggleSidebar} />

        {/* Fixed Dashboard Tabs area */}
        <div className="bg-slate-50 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 lg:pt-5 shrink-0 z-20">
          <DashboardTabs />
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 px-4 sm:px-6 lg:px-8 flex flex-col">
          <div className="flex-1 w-full pb-6 pt-1">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-[#0D3B3E]/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        ></div>
      )}
    </div>
  );
};
