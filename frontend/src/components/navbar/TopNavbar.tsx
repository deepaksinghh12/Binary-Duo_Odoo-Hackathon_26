import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdMenu, MdNotifications, MdLogout, MdAccountCircle, MdDashboard, MdEco, MdPeople, MdGavel, MdEmojiEvents, MdBarChart, MdSettings } from 'react-icons/md';

interface TopNavbarProps {
  toggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getPageInfo = () => {
    const paths = location.pathname.split('/').filter(p => p);
    if (paths.length === 0 || (paths.length === 1 && paths[0] === 'dashboard')) {
      return { title: 'Dashboard', icon: <MdDashboard size={20} /> };
    }
    
    const section = paths[1];
    if (!section) return { title: 'Dashboard', icon: <MdDashboard size={20} /> };

    switch (section) {
      case 'environmental': return { title: 'Environmental', icon: <MdEco size={20} /> };
      case 'social': return { title: 'Social', icon: <MdPeople size={20} /> };
      case 'governance': return { title: 'Governance', icon: <MdGavel size={20} /> };
      case 'gamification': return { title: 'Gamification', icon: <MdEmojiEvents size={20} /> };
      case 'reports': return { title: 'Reports', icon: <MdBarChart size={20} /> };
      case 'settings': return { title: 'Settings', icon: <MdSettings size={20} /> };
      default: return { title: section.charAt(0).toUpperCase() + section.slice(1), icon: <MdDashboard size={20} /> };
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Akshat Sharma';
  const userRole = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Administrator';
  const { title, icon } = getPageInfo();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-[#0D3B3E] hover:bg-slate-100 p-2 rounded-lg transition-colors md:hidden"
        >
          <MdMenu size={24} />
        </button>

        <div className="hidden sm:flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4CAF3A]/10 text-[#4CAF3A] flex items-center justify-center">
            {icon}
          </div>
          <h2 className="text-lg font-bold text-[#0D3B3E] tracking-tight">
            {title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="text-slate-400 hover:text-[#0D3B3E] hover:bg-slate-100 p-2 rounded-full transition-colors relative">
          <MdNotifications size={24} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="hidden md:block text-right">
            <div className="text-sm font-bold text-[#0D3B3E]">{userName}</div>
            <div className="text-xs text-slate-500">{userRole}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <MdAccountCircle size={28} />
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="ml-2 text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
          title="Logout"
        >
          <MdLogout size={22} />
        </button>
      </div>
    </header>
  );
};
