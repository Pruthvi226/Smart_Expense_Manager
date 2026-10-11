import React, { useCallback, useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Sparkles,
  Plus,
  PieChart,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { request } from '../services/api';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, CardHeader, EmptyState, ProgressBar, StatCard, budgetStatus } from '../components/ui';
import { clampPercent, formatCurrency, formatPercent, initials, toNumber } from '../lib/utils';
import type { DashboardSummary, Expense } from '../types';

interface DashboardPageProps {
  onOpenAddModal: () => void;
  onOpenAddIncome: () => void;
  onOpenAiCopilot: () => void;
  onSelectExpense: (expense: Expense) => void;
  onNavigate: (tab: string) => void;
  refreshKey?: number;
}

const CHART_DATA = [
  { name: 'Mon', income: 2400, expense: 800 },
  { name: 'Tue', income: 1800, expense: 1200 },
  { name: 'Wed', income: 3200, expense: 450 },
  { name: 'Thu', income: 2900, expense: 1600 },
  { name: 'Fri', income: 4100, expense: 950 },
  { name: 'Sat', income: 1500, expense: 2100 },
  { name: 'Sun', income: 3800, expense: 600 },
];

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
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await request<DashboardSummary>('/dashboard/summary');
      setSummary(data);
    } catch {
      setLoadError('Could not reach the dashboard API. Showing local transaction totals.');
    }
    await Promise.all([refreshExpenses(), refreshBudgets()]);
    setLoading(false);
    setLastRefreshed(new Date());
  }, [refreshBudgets, refreshExpenses]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard, refreshKey]);

  const totalExpenseFromList = expenses.reduce((s, e) => s + toNumber(e.amount), 0);
  const recentExpenses = (summary?.recentTransactions ?? summary?.recentExpenses ?? expenses).slice(0, 5);
  const displayIncome = toNumber(summary?.totalIncome);
  const displayExpense = toNumber(summary?.totalExpenses ?? summary?.totalExpense, totalExpenseFromList);
  const displayBalance = toNumber(summary?.currentBalance ?? summary?.totalBalance, displayIncome - displayExpense);
  const displaySavings = toNumber(summary?.cashFlow ?? summary?.netSavings, displayIncome - displayExpense);
  const savingsRate = toNumber(summary?.savingsRate);
  const financialScore = Math.round(
    toNumber(summary?.financialScore, Math.min(100, Math.max(0, savingsRate))),
  );
  const firstName = user?.name?.split(' ')[0] || 'there';
  const quickActions = [
    {
      label: 'Add Expense',
      sub: 'Record spending',
      icon: Plus,
      iconClass: 'bg-teal-500/20 text-teal-400',
      hoverClass: 'hover:bg-teal-600/10 hover:border-teal-500/30',
      onClick: onOpenAddModal,
    },
    {
      label: 'Add Income',
      sub: 'Record earnings',
      icon: DollarSign,
      iconClass: 'bg-emerald-500/20 text-emerald-400',
      hoverClass: 'hover:bg-emerald-600/10 hover:border-emerald-500/30',
      onClick: onOpenAddIncome,
    },
    {
      label: 'Manage Budgets',
      sub: 'Monthly caps',
      icon: PieChart,
      iconClass: 'bg-amber-500/20 text-amber-400',
      hoverClass: 'hover:bg-amber-600/10 hover:border-amber-500/30',
      onClick: () => onNavigate('budgets'),
    },
    {
      label: 'Ask AI Copilot',
      sub: 'Spending insights',
      icon: Sparkles,
      iconClass: 'bg-cyan-500/20 text-cyan-400',
      hoverClass: 'hover:bg-cyan-600/10 hover:border-cyan-500/30',
      onClick: onOpenAiCopilot,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <Card className="relative overflow-hidden" padding="lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/90">Overview</p>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Hello, {firstName}</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {summary?.monthOverMonthSavingsChange != null ? (
                <>
                  You saved{' '}
                  <span className="text-emerald-400 font-bold tabular-nums">
                    {formatPercent(summary.monthOverMonthSavingsChange)} more
                  </span>{' '}
                  than last month.
                </>
              ) : (
                'Your workspace is ready — add income and expenses to unlock live insights.'
              )}
            </p>
            {summary?.aiRecommendation && (
              <p className="text-xs text-cyan-300/80 mt-1">{summary.aiRecommendation}</p>
            )}
            {loadError && <p className="text-xs text-amber-300/90 mt-1">{loadError}</p>}
          </div>

          <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                <path
                  className="text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-teal-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${financialScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-extrabold text-white tabular-nums leading-none">
                  {financialScore || '—'}
                </span>
                <span className="block text-[9px] text-zinc-400 uppercase font-semibold">Score</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <ShieldCheck size={16} />
                <span>Financial health</span>
              </div>
              <button
                type="button"
                onClick={onOpenAiCopilot}
                className="mt-2 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                View AI recommendations
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 hidden sm:inline">
            Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void loadDashboard()}
            disabled={loading}
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Balance"
          value={formatCurrency(displayBalance)}
          change={summary ? 'From dashboard summary' : 'Awaiting API'}
          icon={Wallet}
          tone="teal"
          onClick={() => onNavigate('analytics')}
        />
        <StatCard
          label="Monthly Income"
          value={formatCurrency(displayIncome)}
          change="Add income"
          icon={TrendingUp}
          tone="emerald"
          onClick={onOpenAddIncome}
        />
        <StatCard
          label="Monthly Expenses"
          value={formatCurrency(displayExpense)}
          change="View transactions"
          icon={TrendingDown}
          tone="rose"
          trend="down"
          onClick={() => onNavigate('transactions')}
        />
        <StatCard
          label="Net Savings"
          value={formatCurrency(displaySavings)}
          change={`${savingsRate.toFixed(1)}% savings rate`}
          icon={Sparkles}
          tone="cyan"
          onClick={() => onNavigate('reports')}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map(({ label, sub, icon: Icon, iconClass, hoverClass, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className={`p-4 rounded-2xl glass-card flex items-center gap-3 transition-all text-left group border border-transparent ${hoverClass}`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${iconClass}`}
            >
              <Icon size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{label}</h4>
              <p className="text-[11px] text-zinc-400">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
            <CardHeader title="Cashflow velocity (7 days)" subtitle="Illustrative week sample — not yet sourced from the analytics API" />
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525B" fontSize={11} tickLine={false} />
                <YAxis stroke="#52525B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1c27',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="space-y-4">
          <CardHeader
            title="Budget health"
            action={
              <button
                type="button"
                onClick={() => onNavigate('budgets')}
                className="text-xs text-teal-300 hover:text-teal-200 font-semibold"
              >
                View all
              </button>
            }
          />
          <div className="space-y-4 pt-2">
            {budgets.length === 0 ? (
              <EmptyState
                icon={PieChart}
                title="No budgets yet"
                action={
                  <button
                    type="button"
                    onClick={() => onNavigate('budgets')}
                    className="text-teal-300 text-xs font-semibold hover:underline"
                  >
                    Create one →
                  </button>
                }
              />
            ) : (
              budgets.slice(0, 5).map((b) => {
                const spent = b.spentAmount || 0;
                const pct = clampPercent(spent, b.limitAmount);
                const status = budgetStatus(spent, b.limitAmount);
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate max-w-[120px]">{b.category}</span>
                      <span className="tabular-nums font-mono text-zinc-400 text-[10px]">
                        {formatCurrency(spent, { compact: true })} /{' '}
                        {formatCurrency(b.limitAmount, { compact: true })}
                      </span>
                    </div>
                    <ProgressBar percent={pct} status={status} />
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <CardHeader
          title="Recent transactions"
          subtitle={`Last ${recentExpenses.length} entries`}
          action={
            <button
              type="button"
              onClick={() => onNavigate('transactions')}
              className="text-xs text-teal-300 hover:text-teal-200 font-semibold flex items-center gap-1"
            >
              See all
              <ChevronRight size={14} />
            </button>
          }
        />

        {recentExpenses.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            action={
              <Button size="sm" onClick={onOpenAddModal}>
                Add your first
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Merchant</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 hidden sm:table-cell">Payment</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    onClick={() => onSelectExpense(exp)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSelectExpense(exp);
                    }}
                  >
                    <td className="py-3.5 pl-2 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-600/20 text-teal-300 flex items-center justify-center font-bold text-xs border border-teal-500/30">
                          {initials(exp.title)}
                        </div>
                        <div>
                          <span>{exp.title}</span>
                          <p className="text-[10px] text-zinc-500 font-normal">
                            {exp.location || 'No location'}
                          </p>
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
                      -{formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
