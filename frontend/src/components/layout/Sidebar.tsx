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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  openAiCopilot?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<any>;
  badge?: string;
  badgeColor?: string;
  isSpecial?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
}) => {
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai', label: 'AI Copilot', icon: Sparkles, isSpecial: true },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[#09090B] border-r border-white/10 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Section */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl primary-gradient-bg flex items-center justify-center font-bold text-white shadow-lg primary-gradient-glow text-lg">
                S
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-wide text-white leading-none">
                  SmartExpense
                </h1>
                <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">
                  Enterprise V2
                </span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-xl primary-gradient-bg flex items-center justify-center font-bold text-white shadow-lg primary-gradient-glow">
              S
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : item.isSpecial
                    ? 'text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                <Icon
                  size={20}
                  className={`${
                    isActive
                      ? 'text-indigo-400'
                      : item.isSpecial
                      ? 'text-cyan-400 animate-pulse'
                      : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                />

                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-zinc-800 text-white text-xs font-semibold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl border border-white/10">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Section */}
      <div className="p-3 border-t border-white/5">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow">
            {user?.name ? user.name.charAt(0) : 'P'}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Pruthviraj'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'admin@smartexpense.com'}</p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
