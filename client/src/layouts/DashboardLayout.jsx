import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('studypulse-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const handleCollapseChange = (e) => {
      setIsCollapsed(e.detail.collapsed);
    };
    window.addEventListener('sidebar-collapse-change', handleCollapseChange);
    return () => window.removeEventListener('sidebar-collapse-change', handleCollapseChange);
  }, []);

  return (
    <div className="min-h-screen text-text-main dark:text-white transition-colors duration-300">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Nav & Drawer */}
      <MobileNav />

      {/* Main Content Area */}
      <div className={`pt-14 lg:pt-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-[112px]' : 'lg:pl-[304px]'}`}>
        {/* Subtle overlay for dark mode so ocean doesn't dominate content */}
        <div className="min-h-screen dark:bg-slate-950/25">
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
