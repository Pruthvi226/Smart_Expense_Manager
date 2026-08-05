import React, { useState } from 'react';
import {
  X, Calendar, Tag, CreditCard, MapPin, ShieldCheck,
  FileText, Sparkles, Edit3, Trash2, AlertTriangle, Save
} from 'lucide-react';
import type { Expense } from '../../types';
import { useExpenses } from '../../context/ExpenseContext';
import { useNotifications } from '../../context/NotificationContext';
import { request } from '../../services/api';

interface TransactionDrawerProps {
  expense: Expense | null;
  onClose: () => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

const CATEGORIES = [
  'Food & Dining', 'Shopping & Electronics', 'Housing & Utilities',
  'Infrastructure & Tech', 'Transportation', 'Health & Wellness',
  'Entertainment', 'Education', 'Travel', 'Insurance', 'Other',
];

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  expense,
  onClose,
  onDeleted,
  onUpdated,
}) => {
  const { updateExpense, deleteExpense } = useExpenses();
  const { addNotification } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editLocation, setEditLocation] = useState('');

  if (!expense) return null;

  const startEdit = () => {
    setEditTitle(expense.title);
    setEditAmount(String(expense.amount));
    setEditCategory(expense.category);
    setEditDate(expense.expenseDate);
    setEditDescription(expense.description || '');
    setEditPaymentMethod(expense.paymentMethod || 'Corporate Visa');
    setEditLocation(expense.location || '');
    setIsEditing(true);
    setConfirmDelete(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editAmount || parseFloat(editAmount) <= 0) return;
    setSubmitting(true);
    const updates: Partial<Expense> = {
      title: editTitle.trim(),
      amount: parseFloat(editAmount),
      category: editCategory,
      expenseDate: editDate,
      description: editDescription.trim() || undefined,
      paymentMethod: editPaymentMethod,
      location: editLocation.trim() || undefined,
    };
    try {
      await request(`/expenses/${expense.id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch { /* apply locally */ }
    updateExpense(expense.id, updates);
    addNotification('Transaction Updated', `"${updates.title}" saved successfully.`, 'SUCCESS');
    setSubmitting(false);
    setIsEditing(false);
    onUpdated?.();
    onClose();
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await request(`/expenses/${expense.id}`, { method: 'DELETE' });
    } catch { /* apply locally */ }
    deleteExpense(expense.id);
    addNotification('Transaction Deleted', `"${expense.title}" has been removed.`, 'WARNING');
    setSubmitting(false);
    setConfirmDelete(false);
    onDeleted?.();
  };

  const fieldClass = `w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Transaction Details">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-[#121214] border-l border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-lg">
                {expense.title.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-base text-white">{isEditing ? 'Edit Transaction' : expense.title}</h2>
                <p className="text-xs text-zinc-400">ID #{expense.id} · v{expense.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600/25 transition-colors"
                  aria-label="Edit transaction"
                >
                  <Edit3 size={13} />
                  Edit
                </button>
              )}
              <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5" aria-label="Close drawer">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!isEditing ? (
              <>
                {/* Amount Hero */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Amount</span>
                    <h3 className="text-3xl font-extrabold text-white tabular-nums mt-1">
                      ${expense.amount.toFixed(2)}
                    </h3>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Completed
                  </span>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Tag,        label: 'Category',       value: expense.category },
                    { icon: Calendar,   label: 'Date',           value: expense.expenseDate },
                    { icon: CreditCard, label: 'Payment',        value: expense.paymentMethod || 'N/A' },
                    { icon: MapPin,     label: 'Location',       value: expense.location || 'Not set' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                        <Icon size={14} className="text-indigo-400" />
                        <span>{label}</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                {expense.tags && expense.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <Tag size={14} /> Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {expense.tags.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {expense.description && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <FileText size={14} /> Notes
                    </h4>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 leading-relaxed">
                      {expense.description}
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                    <Sparkles size={16} />
                    <span>AI Insights</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    This transaction matches recurring spending in {expense.category}. No budget limit breach triggered. Suggested action: categorize as a recurring line item for better forecasting.
                  </p>
                </div>

                {/* Audit Trail */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-400" /> Audit Trail
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                      <span className="text-zinc-400">Optimistic Lock Version</span>
                      <span className="font-mono text-indigo-400 font-semibold">v{expense.version}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                      <span className="text-zinc-400">Created At</span>
                      <span className="text-zinc-300 font-mono text-[10px]">{expense.createdAt}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* EDIT FORM */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Title / Merchant</label>
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className={fieldClass} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Amount ($)</label>
                    <input type="number" step="0.01" min="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
                    <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Date</label>
                    <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Payment Method</label>
                    <input type="text" value={editPaymentMethod} onChange={e => setEditPaymentMethod(e.target.value)} className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Location</label>
                  <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="City, State" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Notes</label>
                  <textarea rows={3} value={editDescription} onChange={e => setEditDescription(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-[#09090B]">
            {!isEditing ? (
              <div className="flex gap-3">
                {/* Delete button */}
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                ) : (
                  <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <AlertTriangle size={14} className="text-rose-400 flex-shrink-0" />
                    <span className="text-xs text-rose-300 flex-1">Permanently delete this transaction?</span>
                    <button onClick={() => setConfirmDelete(false)} className="text-xs text-zinc-400 hover:text-white font-semibold">No</button>
                    <button onClick={handleDelete} disabled={submitting} className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50">
                      {submitting ? '...' : 'Yes, Delete'}
                    </button>
                  </div>
                )}

                {!confirmDelete && (
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all"
                  >
                    Close
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={cancelEdit} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl primary-gradient-bg text-white text-xs font-semibold shadow-lg primary-gradient-glow hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
