import React, { useEffect } from 'react';
import { Search, Plus, Bell, Sparkles, Command } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface TopNavProps {
  collapsed: boolean;
  openAddModal: () => void;
  openCommandPalette: () => void;
  openAiCopilot: () => void;
  toggleNotifications: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  collapsed,
  openAddModal,
  openCommandPalette,
  openAiCopilot,
  toggleNotifications,
}) => {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  // Global Ctrl+K shortcut to open command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openCommandPalette]);

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-30 bg-[#09090B]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300 flex items-center justify-between px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Global Command Search Bar */}
      <div className="flex-1 max-w-md">
        <button
          onClick={openCommandPalette}
          className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-zinc-400 hover:text-zinc-200 text-sm transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search size={16} className="text-zinc-500 group-hover:text-indigo-400 transition-colors" />
            <span className="text-xs">Search transactions, budgets, AI insights...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-zinc-400 border border-white/10">
            <Command size={10} /> K
          </kbd>
        </button>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-3">
        {/* Ask AI Quick Trigger */}
        <button
          onClick={openAiCopilot}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <Sparkles size={15} className="animate-spin-slow" />
          <span>Ask AI Assistant</span>
        </button>

        {/* Quick Add Expense / Income Button */}
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl primary-gradient-bg text-white text-xs font-semibold shadow-lg primary-gradient-glow hover:opacity-95 transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Add Transaction</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={toggleNotifications}
          className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-[#09090B]" />
          )}
        </button>

        {/* User Profile Avatar */}
        <div className="pl-2 border-l border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs shadow-inner">
            {user?.name ? user.name.charAt(0) : 'P'}
          </div>
        </div>
      </div>
    </header>
  );
};
