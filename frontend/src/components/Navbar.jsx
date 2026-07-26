import React from 'react';
import { Plus, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenCreateModal }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 glass-panel border-b border-dark-border px-8 flex items-center justify-between sticky top-0 z-10 ml-64">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white">Social Media Control Hub</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick New Post Trigger Button */}
        <button
          onClick={onOpenCreateModal}
          className="gradient-btn px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold hover:scale-[1.02] transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>Create & Schedule Post</span>
        </button>

        {/* Notifications Icon */}
        <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"></span>
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-dark-border">
          <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-gray-200">{user?.name || 'Developer'}</p>
            <p className="text-[10px] text-gray-400">{user?.email || 'admin@postpulse.ai'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
