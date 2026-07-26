import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Sparkles, 
  Share2, 
  BarChart3, 
  Zap, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Visual Calendar', icon: CalendarDays, path: '/calendar' },
    { label: 'AI Content Studio', icon: Sparkles, path: '/ai-studio' },
    { label: 'Connected Accounts', icon: Share2, path: '/accounts' },
    { label: 'Analytics & Insights', icon: BarChart3, path: '/analytics' },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-dark-border flex flex-col justify-between h-screen fixed left-0 top-0 z-20">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-dark-border/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight gradient-text">PostPulse</h1>
            <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full">AI Suite v1.0</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Meta API Mode Badge & Logout */}
      <div className="p-4 border-t border-dark-border/60 space-y-3">
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Meta Graph API
          </span>
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">MOCK READY</span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
