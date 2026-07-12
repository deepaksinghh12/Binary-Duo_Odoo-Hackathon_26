import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

export const SocialLayout: React.FC = () => {
  const [activeId, setActiveId] = useState('csr');
  const navigate  = useNavigate();
  const location  = useLocation();

  const tabs = [
    { label: 'CSR Activities',        id: 'csr',           to: '/dashboard/social/csr' },
    { label: 'Employee Participation', id: 'participation', to: '/dashboard/social/participation' },
    { label: 'Diversity & Inclusion',  id: 'diversity',     to: '/dashboard/social/diversity' },
  ];

  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    if (!scrollContainer) return;

    const observerOptions = {
      root: scrollContainer,
      rootMargin: '-150px 0px -40% 0px',
      threshold: 0,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
          const tab = tabs.find(t => t.id === entry.target.id);
          if (tab && location.pathname !== tab.to) {
            window.history.replaceState(null, '', tab.to);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const timeoutId = setTimeout(() => {
      tabs.forEach(tab => {
        const el = document.getElementById(tab.id);
        if (el) observer.observe(el);
      });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [location.pathname]);

  const handleTabClick = (e: React.MouseEvent, tab: any) => {
    e.preventDefault();
    setActiveId(tab.id);
    navigate(tab.to, { replace: true });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Social Sub-navigation */}
      <div className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-sm pt-2 pb-5 mb-1 -mt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 overflow-x-auto custom-scrollbar shrink-0">
        <nav className="flex w-full min-w-max gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={(e) => handleTabClick(e, tab)}
              className={`flex-1 text-center px-5 py-2 text-sm font-bold transition-all duration-200 whitespace-nowrap rounded-xl ${
                activeId === tab.id
                  ? 'text-[#0D3B3E] bg-[#4CAF3A]/20 border border-[#4CAF3A]/30'
                  : 'text-slate-500 hover:text-[#0D3B3E] hover:bg-slate-50 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-visible">
        <Outlet />
      </div>
    </div>
  );
};
