import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Sparkles, Trash2 } from 'lucide-react';
import type { Budget } from '../../types';
import { useExpenses } from '../../context/ExpenseContext';
import { useNotifications } from '../../context/NotificationContext';
import { request } from '../../services/api';

const CATEGORIES = [
  'Food & Dining',
  'Shopping & Electronics',
  'Housing & Utilities',
  'Infrastructure & Tech',
  'Transportation',
  'Health & Wellness',
  'Entertainment',
  'Education',
  'Travel',
  'Insurance',
];

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, editBudget }) => {
  const { addBudget, updateBudget, deleteBudget, nextBudgetId, budgets } = useExpenses();
  const { addNotification } = useNotifications();

  const isEdit = !!editBudget;
  const now = new Date();

  const [category, setCategory] = useState('Food & Dining');
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (editBudget) {
      setCategory(editBudget.category);
      setLimitAmount(String(editBudget.limitAmount));
      setMonth(editBudget.month);
      setYear(editBudget.year);
    } else {
      setCategory('Food & Dining');
      setLimitAmount('');
      setMonth(now.getMonth() + 1);
      setYear(now.getFullYear());
    }
    setError('');
    setConfirmDelete(false);
  }, [editBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const limit = parseFloat(limitAmount);
    if (!limit || limit <= 0) {
      setError('Please enter a valid budget limit greater than 0.');
      return;
    }

    // Duplicate category check (only for new budgets)
    if (!isEdit && budgets.some(b => b.category === category && b.month === month && b.year === year)) {
      setError(`A budget for "${category}" already exists for ${month}/${year}.`);
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && editBudget) {
        await request(`/budgets/${editBudget.id}`, {
          method: 'PUT',
          body: JSON.stringify({ category, limitAmount: limit, month, year }),
        });
        updateBudget(editBudget.id, { category, limitAmount: limit, month, year });
        addNotification('Budget Updated', `"${category}" limit updated to $${limit.toFixed(2)}.`, 'SUCCESS');
      } else {
        const newBudget: Budget = {
          id: nextBudgetId(),
          category,
          limitAmount: limit,
          month,
          year,
          userId: 1,
          version: 1,
          spentAmount: 0,
        };
        await request('/budgets', {
          method: 'POST',
          body: JSON.stringify({ category, limitAmount: limit, month, year }),
        });
        addBudget(newBudget);
        addNotification('Budget Created', `New budget for "${category}": $${limit.toFixed(2)}/month.`, 'SUCCESS');
      }
      onClose();
    } catch {
      // API failed — apply locally
      if (isEdit && editBudget) {
        updateBudget(editBudget.id, { category, limitAmount: limit, month, year });
        addNotification('Budget Updated', `"${category}" limit updated to $${limit.toFixed(2)}.`, 'SUCCESS');
      } else {
        addBudget({
          id: nextBudgetId(),
          category,
          limitAmount: limit,
          month,
          year,
          userId: 1,
          version: 1,
          spentAmount: 0,
        });
        addNotification('Budget Created (Local)', `Budget for "${category}": $${limit.toFixed(2)}/month.`, 'SUCCESS');
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editBudget) return;
    setSubmitting(true);
    try {
      await request(`/budgets/${editBudget.id}`, { method: 'DELETE' });
    } catch { /* apply locally */ }
    deleteBudget(editBudget.id);
    addNotification('Budget Deleted', `Budget for "${editBudget.category}" has been removed.`, 'WARNING');
    setSubmitting(false);
    onClose();
  };

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const years = [2024, 2025, 2026, 2027];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-modal-title"
    >
      <div
        className="w-full max-w-md bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeInScale 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 id="budget-modal-title" className="font-bold text-lg text-white">
                {isEdit ? 'Edit Budget' : 'New Budget Cap'}
              </h2>
              <p className="text-xs text-zinc-400">Set monthly spending limits per category</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              disabled={isEdit}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {isEdit && <p className="text-[10px] text-zinc-500 mt-1">Category cannot be changed. Delete and recreate instead.</p>}
          </div>

          {/* Limit */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Monthly Limit ($)</label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              placeholder="e.g. 500.00"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors tabular-nums font-semibold"
              autoFocus={!isEdit}
            />
          </div>

          {/* Month + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                disabled={isEdit}
              >
                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                disabled={isEdit}
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            {isEdit && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={submitting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl primary-gradient-bg text-xs font-semibold text-white shadow-lg primary-gradient-glow hover:opacity-95 transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : isEdit ? 'Update Budget' : 'Create Budget'}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation */}
        {confirmDelete && (
          <div className="absolute inset-0 bg-[#121214]/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-2xl">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <AlertTriangle size={32} className="text-rose-400" />
            </div>
            <h3 className="font-bold text-lg text-white">Delete Budget?</h3>
            <p className="text-sm text-zinc-400">
              This will permanently remove the <strong className="text-white">{editBudget?.category}</strong> budget cap.
              Historical transactions are unaffected.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
              >
                Keep Budget
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
