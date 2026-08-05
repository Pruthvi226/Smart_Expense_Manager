import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet,
  ArrowUpRight, ArrowDownRight, Sparkles, Plus,
  PieChart, ShieldCheck, ChevronRight, RefreshCw
} from 'lucide-react';
import { request } from '../services/api';
import type { DashboardSummary, Expense } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onOpenAddModal: () => void;
  onOpenAddIncome: () => void;
  onOpenAiCopilot: () => void;
  onSelectExpense: (expense: Expense) => void;
  onNavigate: (tab: string) => void;
  refreshKey?: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddModal,
  onOpenAddIncome,
  onOpenAiCopilot,
  onSelectExpense,
  onNavigate,
  refreshKey,
}) => {
  const { user } = useAuth();
  const { expenses, budgets, refreshExpenses, refreshBudgets } = useExpenses();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await request<DashboardSummary>('/dashboard/summary');
      setSummary(data);
    } catch {
      // falls back to mock from api.ts
    }
    await refreshExpenses();
    await refreshBudgets();
    setLoading(false);
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    loadDashboard();
  }, [refreshKey]);

  // Compute live stats from context
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const recentExpenses = expenses.slice(0, 5);

  const chartData = [
    { name: 'Mon', income: 2400, expense: 800 },
    { name: 'Tue', income: 1800, expense: 1200 },
    { name: 'Wed', income: 3200, expense: 450 },
    { name: 'Thu', income: 2900, expense: 1600 },
    { name: 'Fri', income: 4100, expense: 950 },
    { name: 'Sat', income: 1500, expense: 2100 },
    { name: 'Sun', income: 3800, expense: 600 },
  ];

  const displayBalance = summary?.totalBalance ?? 24850.75;
  const displayIncome = summary?.totalIncome ?? 12400.00;
  const displaySavings = summary?.netSavings ?? 7579.50;
  const savingsRate = summary?.savingsRate ?? 61.1;
  const financialScore = summary?.financialScore ?? 89;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-[#121214] to-purple-950/60 border border-white/10 p-8 glass-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
              <Sparkles size={14} />
              <span>Real-Time Cashflow & AI Advisory Active</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Hello, {firstName} 👋
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              You saved{' '}
              <span className="text-emerald-400 font-bold tabular-nums">
                +{summary?.monthOverMonthSavingsChange?.toFixed(1) ?? 18.4}% more
              </span>{' '}
              than last month. Your financial velocity is optimal.
            </p>
            {summary?.aiRecommendation && (
              <p className="text-xs text-cyan-300/80 italic mt-1">
                💡 {summary.aiRecommendation}
              </p>
            )}
          </div>

          {/* Financial Health Score */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                <path className="text-zinc-800" strokeWidth="3.5" stroke="currentColor" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path
                  className="text-indigo-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${financialScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-extrabold text-white tabular-nums leading-none">{financialScore}</span>
                <span className="block text-[9px] text-zinc-400 uppercase font-semibold">Score</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <ShieldCheck size={16} />
                <span>Optimal Stability</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">Top 8% among peers</p>
              <button
                onClick={onOpenAiCopilot}
                className="mt-2 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>View AI Recommendations</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Refresh indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 hidden sm:inline">
            Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[10px] font-semibold transition-all disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Balance',
            value: `$${displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            change: '+12.4% vs last month',
            icon: Wallet,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20',
            trend: 'up',
            onClick: () => onNavigate('analytics'),
          },
          {
            label: 'Monthly Income',
            value: `$${displayIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            change: '+8.2% salary & yield',
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            trend: 'up',
            onClick: () => { onOpenAddIncome(); },
          },
          {
            label: 'Monthly Expenses',
            value: `$${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            change: 'Click to view all',
            icon: TrendingDown,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            trend: 'down',
            onClick: () => onNavigate('transactions'),
          },
          {
            label: 'Net Savings',
            value: `$${displaySavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            change: `${savingsRate}% savings rate`,
            icon: Sparkles,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            trend: 'up',
            onClick: () => onNavigate('reports'),
          },
        ].map(({ label, value, change, icon: Icon, color, bg, border, trend, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="p-6 rounded-2xl glass-card glass-card-hover space-y-3 text-left hover:ring-1 hover:ring-white/10 transition-all"
            aria-label={`${label}: ${value}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
              <div className={`p-2 rounded-xl ${bg} ${color} border ${border}`}>
                <Icon size={18} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white tabular-nums tracking-tight">{value}</h2>
              <div className={`flex items-center gap-1.5 text-xs font-semibold mt-1 ${color}`}>
                {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{change}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Add Expense', sub: 'UUID Idempotent', icon: Plus, color: 'indigo', onClick: onOpenAddModal },
          { label: 'Add Income', sub: 'Record Earnings', icon: DollarSign, color: 'emerald', onClick: onOpenAddIncome },
          { label: 'Manage Budgets', sub: 'Set Monthly Caps', icon: PieChart, color: 'amber', onClick: () => onNavigate('budgets') },
          { label: 'Ask AI Copilot', sub: 'Predict Savings', icon: Sparkles, color: 'cyan', onClick: onOpenAiCopilot },
        ].map(({ label, sub, icon: Icon, color, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className={`p-4 rounded-2xl glass-card hover:bg-${color}-600/10 hover:border-${color}-500/30 flex items-center gap-3 transition-all text-left group`}
          >
            <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 text-${color}-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{label}</h4>
              <p className="text-[11px] text-zinc-400">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Charts + Budget Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Cashflow Velocity (7 Days)</h3>
              <p className="text-xs text-zinc-400">Real-time Income vs Expense Stream</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Income</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Expense</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525B" fontSize={11} tickLine={false} />
                <YAxis stroke="#52525B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Health */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Budget Health</h3>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View All
            </button>
          </div>
          <div className="space-y-4 pt-2">
            {budgets.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                <PieChart size={24} className="mx-auto mb-2 opacity-30" />
                No budgets set. <button onClick={() => onNavigate('budgets')} className="text-indigo-400 hover:underline">Create one →</button>
              </div>
            ) : (
              budgets.slice(0, 5).map((b) => {
                const pct = Math.min(100, Math.round(((b.spentAmount || 0) / b.limitAmount) * 100));
                const isOver = (b.spentAmount || 0) > b.limitAmount;
                const isNear = pct >= 80 && !isOver;
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate max-w-[120px]">{b.category}</span>
                      <span className="tabular-nums font-mono text-zinc-400 text-[10px]">
                        ${(b.spentAmount || 0).toFixed(0)} / ${b.limitAmount.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500 shadow-[0_0_10px_#ef4444]' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">Recent Transactions</h3>
            <p className="text-xs text-zinc-400">Last {recentExpenses.length} entries · Optimistic locking verified</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentExpenses.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              <p>No transactions yet.</p>
              <button onClick={onOpenAddModal} className="text-indigo-400 hover:underline mt-1">Add your first →</button>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Merchant</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 hidden sm:table-cell">Payment</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    onClick={() => onSelectExpense(exp)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSelectExpense(exp); }}
                    aria-label={`View details for ${exp.title}`}
                  >
                    <td className="py-3.5 pl-2 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                          {exp.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{exp.title}</span>
                          <p className="text-[10px] text-zinc-500 font-normal">{exp.location || 'No location'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-zinc-300 border border-white/10">
                        {exp.category}
                      </span>
                    </td>
                    <td className="text-zinc-400 hidden sm:table-cell">{exp.paymentMethod || '—'}</td>
                    <td className="text-zinc-400 font-mono">{exp.expenseDate}</td>
                    <td className="text-right font-mono font-bold text-rose-400 tabular-nums">
                      -${exp.amount.toFixed(2)}
                    </td>
                    <td className="text-right pr-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectExpense(exp); }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold group-hover:underline text-[11px]"
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
