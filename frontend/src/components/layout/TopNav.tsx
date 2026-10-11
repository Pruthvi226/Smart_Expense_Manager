import React, { useEffect } from 'react';
import { Search, Plus, Bell, Sparkles, Command, Menu } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui';
import { initials } from '../../lib/utils';

interface TopNavProps {
  collapsed: boolean;
  openAddModal: () => void;
  openCommandPalette: () => void;
  openAiCopilot: () => void;
  toggleNotifications: () => void;
  onOpenMobileNav?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  collapsed,
  openAddModal,
  openCommandPalette,
  openAiCopilot,
  toggleNotifications,
  onOpenMobileNav,
}) => {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

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
      className={`fixed top-0 right-0 h-16 z-30 bg-[var(--sem-bg)]/85 backdrop-blur-xl border-b border-white/10 transition-all duration-300 flex items-center justify-between px-4 sm:px-6 left-0 ${
        collapsed ? 'md:left-20' : 'md:left-64'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <button
          type="button"
          onClick={openCommandPalette}
          className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-zinc-400 hover:text-zinc-200 text-sm transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Search size={16} className="text-zinc-500 group-hover:text-teal-300 transition-colors" />
            <span className="text-xs truncate">Search transactions, budgets, AI…</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-zinc-400 border border-white/10">
            <Command size={10} /> K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="accent" size="sm" onClick={openAiCopilot} className="hidden sm:inline-flex">
          <Sparkles size={15} />
          Ask AI
        </Button>

        <Button size="sm" onClick={openAddModal}>
          <Plus size={16} />
          <span className="hidden sm:inline">Add transaction</span>
        </Button>

        <button
          type="button"
          onClick={toggleNotifications}
          className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400 ring-4 ring-[var(--sem-bg)]" />
          )}
        </button>

        <div className="pl-2 border-l border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-600/30 border border-teal-500/40 text-teal-200 font-bold flex items-center justify-center text-xs">
            {initials(user?.name, 'U')}
          </div>
        </div>
      </div>
    </header>
  );
};
