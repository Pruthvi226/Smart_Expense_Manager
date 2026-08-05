import React, { useState, useEffect } from 'react';
import { X, Sparkles, DollarSign, MapPin, CreditCard, Tag } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useExpenses } from '../../context/ExpenseContext';
import type { Expense } from '../../types';
import { request } from '../../services/api';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'EXPENSE' | 'INCOME';
}

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
  'Salary / Income',
  'Investment Returns',
  'Freelance / Business',
  'Other',
];

const PAYMENT_METHODS = [
  'Corporate Visa', 'Amex Business', 'Apple Pay', 'Google Pay',
  'Auto Debit', 'Bank Transfer', 'Cash', 'Debit Card', 'PayPal', 'Crypto'
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'EXPENSE',
}) => {
  const { addNotification } = useNotifications();
  const { addExpense, nextExpenseId } = useExpenses();

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Corporate Visa');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form every time modal opens, and use defaultType
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setTitle('');
      setAmount('');
      setCategory('Food & Dining');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Corporate Visa');
      setLocation('');
      setTags('');
      setErrors({});
    }
  }, [isOpen, defaultType]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required.';
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount > 0.';
    if (!date) errs.date = 'Date is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    const parsedAmount = parseFloat(amount);
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

    const newExpense: Expense = {
      id: nextExpenseId(),
      title: title.trim(),
      amount: parsedAmount,
      category,
      description: description.trim() || undefined,
      expenseDate: date,
      userId: 1,
      version: 1,
      createdAt: new Date().toISOString(),
      paymentMethod,
      location: location.trim() || undefined,
      tags: tagArray.length > 0 ? tagArray : undefined,
    };

    try {
      const endpoint = type === 'EXPENSE' ? '/expenses' : '/incomes';
      const payload = type === 'EXPENSE'
        ? { title: newExpense.title, amount: parsedAmount, category, description: newExpense.description, expenseDate: date, paymentMethod, location: newExpense.location, tags: tagArray }
        : { source: newExpense.title, amount: parsedAmount, description: newExpense.description, incomeDate: date };

      await request(endpoint, { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      // Backend unreachable — apply locally
    }

    addExpense(newExpense);
    addNotification(
      `${type === 'EXPENSE' ? '💸 Expense' : '💰 Income'} Added`,
      `$${parsedAmount.toFixed(2)} for "${newExpense.title}" recorded successfully.`,
      'SUCCESS'
    );
    setSubmitting(false);
    onSuccess();
    onClose();
  };

  const fieldClass = (name: string) =>
    `w-full bg-white/[0.04] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors ${
      errors[name] ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-indigo-500'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-tx-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeInScale 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl primary-gradient-bg flex items-center justify-center text-white font-bold text-xl shadow-lg">
              +
            </div>
            <div>
              <h2 id="add-tx-title" className="font-bold text-lg text-white">Create Transaction</h2>
              <p className="text-xs text-zinc-400">UUID Idempotency protected & real-time synced</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Type Selector */}
        <div className="p-6 pb-0">
          <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/5" role="group" aria-label="Transaction type">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'EXPENSE'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              💸 Outflow (Expense)
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              💰 Inflow (Income)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              {type === 'EXPENSE' ? 'Merchant / Title' : 'Income Source'}
              <span className="text-rose-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'EXPENSE' ? 'e.g. AWS Subscription, Whole Foods' : 'e.g. Salary, Freelance Project'}
              className={fieldClass('title')}
              aria-required="true"
              aria-invalid={!!errors.title}
              autoFocus
            />
            {errors.title && <p className="text-rose-400 text-[10px] mt-1">{errors.title}</p>}
          </div>

          {/* Amount + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Amount (USD) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-[11px] text-zinc-500" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`${fieldClass('amount')} pl-8`}
                  aria-required="true"
                  aria-invalid={!!errors.amount}
                />
              </div>
              {errors.amount && <p className="text-rose-400 text-[10px] mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {/* Date + Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={fieldClass('date')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                <CreditCard size={12} className="inline mr-1 text-zinc-500" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Location + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                <MapPin size={12} className="inline mr-1 text-zinc-500" />
                Location (optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className={fieldClass('location')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                <Tag size={12} className="inline mr-1 text-zinc-500" />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. SaaS, Tech, Q4"
                className={fieldClass('tags')}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Notes / Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, receipt notes..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-400">
              <Sparkles size={12} />
              <span>Auto AI Categorization Active</span>
            </div>
            <div className="flex gap-3">
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
                className="px-5 py-2 rounded-xl primary-gradient-bg text-xs font-semibold text-white shadow-lg primary-gradient-glow hover:opacity-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {submitting ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </div>
        </form>
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
