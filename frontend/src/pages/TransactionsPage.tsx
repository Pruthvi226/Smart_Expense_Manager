import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Plus, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, Filter, X, SlidersHorizontal,
  FileSpreadsheet, Trash2
} from 'lucide-react';
import type { Expense } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import { useNotifications } from '../context/NotificationContext';

interface TransactionsPageProps {
  onOpenAddModal: () => void;
  onSelectExpense: (expense: Expense) => void;
  refreshKey?: number;
}

type SortField = 'title' | 'amount' | 'expenseDate' | 'category';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 8;

const CATEGORY_OPTIONS = [
  'ALL', 'Food & Dining', 'Shopping & Electronics', 'Housing & Utilities',
  'Infrastructure & Tech', 'Transportation', 'Health & Wellness',
  'Entertainment', 'Education', 'Travel', 'Insurance',
];

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddModal,
  onSelectExpense,
}) => {
  const { expenses, deleteExpense } = useExpenses();
  const { addNotification } = useNotifications();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortField, setSortField] = useState<SortField>('expenseDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-zinc-600" />;
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-indigo-400" /> : <ArrowDown size={12} className="text-indigo-400" />;
  };

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => {
        const matchQuery = query === '' ||
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.category.toLowerCase().includes(query.toLowerCase()) ||
          (e.description ?? '').toLowerCase().includes(query.toLowerCase()) ||
          (e.location ?? '').toLowerCase().includes(query.toLowerCase()) ||
          (e.tags ?? []).some(t => t.toLowerCase().includes(query.toLowerCase()));

        const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
        const matchDateFrom = !dateFrom || e.expenseDate >= dateFrom;
        const matchDateTo = !dateTo || e.expenseDate <= dateTo;
        const matchAmtMin = !amountMin || e.amount >= parseFloat(amountMin);
        const matchAmtMax = !amountMax || e.amount <= parseFloat(amountMax);

        return matchQuery && matchCat && matchDateFrom && matchDateTo && matchAmtMin && matchAmtMax;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'amount') cmp = a.amount - b.amount;
        else if (sortField === 'expenseDate') cmp = a.expenseDate.localeCompare(b.expenseDate);
        else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
        else if (sortField === 'category') cmp = a.category.localeCompare(b.category);
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [expenses, query, selectedCategory, dateFrom, dateTo, amountMin, amountMax, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length && paginated.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(e => e.id)));
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteExpense(id));
    addNotification('Bulk Delete', `${selectedIds.size} transaction(s) deleted.`, 'WARNING');
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
  };

  const exportCSV = useCallback(() => {
    const headers = ['ID', 'Title', 'Amount', 'Category', 'Date', 'Payment Method', 'Location', 'Tags', 'Description'];
    const rows = filtered.map(e => [
      e.id, `"${e.title}"`, e.amount.toFixed(2), `"${e.category}"`,
      e.expenseDate, `"${e.paymentMethod ?? ''}"`, `"${e.location ?? ''}"`,
      `"${(e.tags ?? []).join('; ')}"`, `"${e.description ?? ''}"`
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addNotification('Export Complete', `Exported ${filtered.length} transactions as CSV.`, 'SUCCESS');
  }, [filtered, addNotification]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('ALL');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
    setCurrentPage(1);
  };

  const hasActiveFilters = query || selectedCategory !== 'ALL' || dateFrom || dateTo || amountMin || amountMax;

  const colHeaderClass = 'cursor-pointer select-none hover:text-zinc-200 transition-colors flex items-center gap-1';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Transactions & Outflows</h1>
          <p className="text-xs text-zinc-400">
            {filtered.length} transactions · Total: <span className="text-rose-400 font-mono font-bold">${totalFiltered.toFixed(2)}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold border border-white/10 transition-all"
          >
            <FileSpreadsheet size={15} />
            Export CSV
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl primary-gradient-bg text-white text-xs font-semibold shadow-lg primary-gradient-glow hover:opacity-95 transition-all"
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Search + Category pills */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-80 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 focus-within:border-indigo-500/50 transition-all">
            <Search size={16} className="text-zinc-500 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search merchant, category, tags, location..."
              className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              aria-label="Search transactions"
            />
            {query && (
              <button onClick={() => { setQuery(''); setCurrentPage(1); }} className="text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
            {CATEGORY_OPTIONS.slice(0, 7).map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-white/[0.02] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="pt-3 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1 uppercase">From Date</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
                className="w-full bg-[#18181B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1 uppercase">To Date</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
                className="w-full bg-[#18181B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1 uppercase">Min Amount ($)</label>
              <input type="number" min="0" value={amountMin} onChange={e => { setAmountMin(e.target.value); setCurrentPage(1); }} placeholder="0.00"
                className="w-full bg-[#18181B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1 uppercase">Max Amount ($)</label>
              <input type="number" min="0" value={amountMax} onChange={e => { setAmountMax(e.target.value); setCurrentPage(1); }} placeholder="9999.99"
                className="w-full bg-[#18181B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="col-span-2 md:col-span-4 flex items-center gap-2 justify-center text-xs text-zinc-400 hover:text-rose-400 font-semibold transition-colors">
                <X size={13} /> Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/30">
          <span className="text-xs font-semibold text-indigo-300">{selectedIds.size} selected</span>
          <div className="flex-1" />
          {!confirmBulkDelete ? (
            <button onClick={() => setConfirmBulkDelete(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/20 transition-all">
              <Trash2 size={13} /> Delete Selected
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-300">Delete {selectedIds.size} transactions?</span>
              <button onClick={() => setConfirmBulkDelete(false)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold">Cancel</button>
              <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all">Confirm Delete</button>
            </div>
          )}
          <button onClick={() => { setSelectedIds(new Set()); setConfirmBulkDelete(false); }} className="text-zinc-500 hover:text-white">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" role="grid" aria-label="Transactions table">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginated.length && paginated.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded accent-indigo-500"
                    aria-label="Select all"
                  />
                </th>
                <th className="pb-3">
                  <button className={colHeaderClass} onClick={() => handleSort('title')}>
                    Merchant <SortIcon field="title" />
                  </button>
                </th>
                <th className="pb-3">
                  <button className={colHeaderClass} onClick={() => handleSort('category')}>
                    Category <SortIcon field="category" />
                  </button>
                </th>
                <th className="pb-3 hidden md:table-cell">Payment</th>
                <th className="pb-3 hidden lg:table-cell">Location</th>
                <th className="pb-3">
                  <button className={colHeaderClass} onClick={() => handleSort('expenseDate')}>
                    Date <SortIcon field="expenseDate" />
                  </button>
                </th>
                <th className="pb-3 text-right">
                  <button className={colHeaderClass + ' justify-end w-full'} onClick={() => handleSort('amount')}>
                    Amount <SortIcon field="amount" />
                  </button>
                </th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-500">
                      <Filter size={32} className="opacity-30" />
                      <p className="text-sm font-semibold">No transactions found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs text-indigo-400 hover:underline">Clear all filters</button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    role="row"
                  >
                    <td className="py-4 pl-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(exp.id)}
                        onChange={() => toggleSelect(exp.id)}
                        className="rounded accent-indigo-500"
                        aria-label={`Select ${exp.title}`}
                      />
                    </td>
                    <td className="py-4 font-semibold text-white" onClick={() => onSelectExpense(exp)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30 flex-shrink-0">
                          {exp.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="block">{exp.title}</span>
                          {exp.tags && exp.tags.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {exp.tags.slice(0, 2).map((t, i) => (
                                <span key={i} className="text-[9px] px-1.5 rounded bg-white/10 text-zinc-400">#{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td onClick={() => onSelectExpense(exp)}>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-zinc-300 border border-white/10 whitespace-nowrap">
                        {exp.category}
                      </span>
                    </td>
                    <td className="text-zinc-400 hidden md:table-cell" onClick={() => onSelectExpense(exp)}>
                      {exp.paymentMethod || '—'}
                    </td>
                    <td className="text-zinc-400 hidden lg:table-cell" onClick={() => onSelectExpense(exp)}>
                      {exp.location || '—'}
                    </td>
                    <td className="text-zinc-400 font-mono" onClick={() => onSelectExpense(exp)}>
                      {exp.expenseDate}
                    </td>
                    <td className="text-right font-mono font-bold text-rose-400 tabular-nums" onClick={() => onSelectExpense(exp)}>
                      -${exp.amount.toFixed(2)}
                    </td>
                    <td className="text-right pr-2">
                      <button
                        onClick={() => onSelectExpense(exp)}
                        className="px-2.5 py-1 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/10 font-semibold text-[11px] transition-all"
                        aria-label={`View details for ${exp.title}`}
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              {filtered.length === 0 ? '0' : `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)}`} of {filtered.length}
            </span>
            {hasActiveFilters && (
              <span className="text-indigo-400 font-semibold">(filtered from {expenses.length} total)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-zinc-600">...</span>}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Filtered Total', value: `$${totalFiltered.toFixed(2)}`, color: 'text-rose-400' },
          { label: 'Avg per Transaction', value: `$${filtered.length > 0 ? (totalFiltered / filtered.length).toFixed(2) : '0.00'}`, color: 'text-amber-400' },
          { label: 'Highest Transaction', value: `$${filtered.length > 0 ? Math.max(...filtered.map(e => e.amount)).toFixed(2) : '0.00'}`, color: 'text-indigo-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-2xl glass-card text-center">
            <p className="text-[10px] text-zinc-500 uppercase font-semibold">{label}</p>
            <p className={`text-lg font-extrabold tabular-nums mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
