import React, { useState } from 'react';
import { Plus, Sparkles, Edit2, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { BudgetModal } from '../components/budgets/BudgetModal';
import type { Budget } from '../types';

export const BudgetsPage: React.FC = () => {
  const { budgets } = useExpenses();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const openCreate = () => {
    setEditingBudget(null);
    setIsBudgetModalOpen(true);
  };

  const openEdit = (b: Budget) => {
    setEditingBudget(b);
    setIsBudgetModalOpen(true);
  };

  const closeModal = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  };

  const totalLimit = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
  const overCount = budgets.filter(b => (b.spentAmount || 0) > b.limitAmount).length;
  const healthyCount = budgets.filter(b => {
    const pct = ((b.spentAmount || 0) / b.limitAmount) * 100;
    return pct < 80;
  }).length;

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Category Budget Planner</h1>
          <p className="text-xs text-zinc-400">
            {budgets.length} budget{budgets.length !== 1 ? 's' : ''} · {overCount > 0 ? (
              <span className="text-rose-400 font-semibold">{overCount} exceeded</span>
            ) : (
              <span className="text-emerald-400 font-semibold">All within limits</span>
            )}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl primary-gradient-bg text-white text-xs font-semibold shadow-lg primary-gradient-glow hover:opacity-95 transition-all"
        >
          <Plus size={16} />
          New Budget Cap
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Monthly Budget',
            value: `$${totalLimit.toFixed(2)}`,
            sub: `${budgets.length} categories`,
            icon: TrendingUp,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20',
          },
          {
            label: 'Total Spent',
            value: `$${totalSpent.toFixed(2)}`,
            sub: `${totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}% of budget`,
            icon: totalSpent > totalLimit ? AlertTriangle : Sparkles,
            color: totalSpent > totalLimit ? 'text-rose-400' : 'text-cyan-400',
            bg: totalSpent > totalLimit ? 'bg-rose-500/10' : 'bg-cyan-500/10',
            border: totalSpent > totalLimit ? 'border-rose-500/20' : 'border-cyan-500/20',
          },
          {
            label: 'Healthy Budgets',
            value: `${healthyCount} / ${budgets.length}`,
            sub: `${overCount} exceeded`,
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
          },
        ].map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <div key={label} className={`p-5 rounded-2xl glass-card border ${border} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
              <div className={`p-2 rounded-xl ${bg} ${color} border ${border}`}>
                <Icon size={16} />
              </div>
            </div>
            <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
            <p className="text-[11px] text-zinc-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Budget Grid */}
      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass-card rounded-3xl">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <Sparkles size={36} className="text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-300">No budgets set yet</h3>
          <p className="text-xs text-zinc-500 max-w-xs">
            Create monthly spending caps per category to stay on track with your financial goals.
          </p>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-xl primary-gradient-bg text-white text-xs font-semibold shadow-lg primary-gradient-glow hover:opacity-95 transition-all"
          >
            <Plus size={14} className="inline mr-1.5" />
            Create First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const spent = b.spentAmount || 0;
            const pct = Math.min(100, Math.round((spent / b.limitAmount) * 100));
            const isOver = spent > b.limitAmount;
            const isNear = pct >= 80 && !isOver;

            return (
              <div
                key={b.id}
                className={`p-6 rounded-3xl glass-card space-y-5 transition-all hover:scale-[1.01] ${
                  isOver
                    ? 'border-rose-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)]'
                    : isNear
                    ? 'border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                    : 'border-white/10'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white">{b.category}</h3>
                    <span className="text-[11px] text-zinc-400">
                      {monthNames[b.month - 1]} {b.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isOver
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                          : isNear
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {isOver ? 'EXCEEDED' : isNear ? 'NEAR LIMIT' : 'HEALTHY'}
                    </span>
                  </div>
                </div>

                {/* Amount Counter */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Spent</span>
                    <p className={`text-2xl font-extrabold tabular-nums ${isOver ? 'text-rose-400' : 'text-white'}`}>
                      ${spent.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Limit</span>
                    <p className="text-sm font-bold text-zinc-400 tabular-nums">${b.limitAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                    <span>{pct}% Used</span>
                    <span className={isOver ? 'text-rose-400' : 'text-zinc-400'}>
                      {isOver
                        ? `$${(spent - b.limitAmount).toFixed(2)} over`
                        : `$${(b.limitAmount - spent).toFixed(2)} left`}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Sparkles size={13} className="text-cyan-400" />
                    <span className="text-[11px]">AI: {isOver ? 'Reduce spend urgently' : isNear ? 'Close to limit' : 'On track for next month'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-600/15 transition-colors"
                      aria-label={`Edit ${b.category} budget`}
                      title="Edit budget"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add new card */}
          <button
            onClick={openCreate}
            className="p-6 rounded-3xl border-2 border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-indigo-600/5 transition-all flex flex-col items-center justify-center gap-3 text-zinc-500 hover:text-indigo-400 min-h-[280px]"
          >
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Plus size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">Add Budget Category</p>
              <p className="text-xs mt-1">Set monthly spending cap</p>
            </div>
          </button>
        </div>
      )}

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={closeModal}
        editBudget={editingBudget}
      />
    </div>
  );
};
