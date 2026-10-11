import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  BarChart3,
  Sparkles,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn, initials } from '../../lib/utils';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  openAiCopilot?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  accent?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'budgets', label: 'Budgets', icon: PieChart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'ai', label: 'AI Copilot', icon: Sparkles, accent: true },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  mobileOpen = false,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.history.replaceState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen z-50 bg-[var(--sem-bg)] border-r border-white/10 transition-transform md:transition-all duration-300 flex flex-col justify-between',
        collapsed ? 'w-20' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
    >
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-extrabold text-sm">
                SE
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-wide text-white leading-none">SmartExpense</h1>
                <span className="text-[10px] uppercase tracking-widest text-teal-300/80 font-semibold">
                  Platform
                </span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-extrabold">
              SE
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    : item.accent
                      ? 'text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent',
                )}
              >
                <Icon size={20} />
                {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-zinc-800 text-white text-xs font-semibold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-white/10">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-white/5">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5',
            collapsed && 'justify-center',
          )}
        >
          <div className="w-8 h-8 rounded-full bg-teal-600/30 text-teal-200 font-bold flex items-center justify-center text-xs border border-teal-500/30">
            {initials(user?.name, 'U')}
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Guest'}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'Not signed in'}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
