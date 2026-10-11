import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Expense, Budget } from '../types';
import { isDemoMode, mockBudgets, mockExpenses, request } from '../services/api';
import { useAuth } from './AuthContext';

interface ExpenseContextType {
  loadError: string;
  loading: boolean;
  expenses: Expense[];
  budgets: Budget[];
  addExpense: (exp: Expense) => void;
  updateExpense: (id: number, updates: Partial<Expense>) => void;
  deleteExpense: (id: number) => void;
  addBudget: (b: Budget) => void;
  updateBudget: (id: number, updates: Partial<Budget>) => void;
  deleteBudget: (id: number) => void;
  refreshExpenses: () => Promise<void>;
  refreshBudgets: () => Promise<void>;
  nextExpenseId: () => number;
  nextBudgetId: () => number;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

function initialExpenses(): Expense[] {
  return isDemoMode() ? mockExpenses : [];
}

function initialBudgets(): Budget[] {
  return isDemoMode() ? mockBudgets : [];
}

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const { isAuthenticated } = useAuth();
  const [expenseError, setExpenseError] = useState('');
  const [budgetError, setBudgetError] = useState('');
  const loadError = expenseError || budgetError;
  const [loading, setLoading] = useState(false);
  const pendingExpenses = useRef<Promise<void> | null>(null);

  const nextExpenseId = useCallback(
    () => (expenses.length ? Math.max(...expenses.map((e) => e.id)) : 0) + 1,
    [expenses],
  );
  const nextBudgetId = useCallback(
    () => (budgets.length ? Math.max(...budgets.map((b) => b.id)) : 0) + 1,
    [budgets],
  );

  const addExpense = useCallback((exp: Expense) => {
    setExpenses((prev) => [exp, ...prev]);
  }, []);

  const updateExpense = useCallback((id: number, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, version: (e.version ?? 0) + 1 } : e)),
    );
  }, []);

  const deleteExpense = useCallback((id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addBudget = useCallback((b: Budget) => {
    setBudgets((prev) => [b, ...prev]);
  }, []);

  const updateBudget = useCallback((id: number, updates: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, version: (b.version ?? 0) + 1 } : b)),
    );
  }, []);

  const deleteBudget = useCallback((id: number) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const refreshExpenses = useCallback(async () => {
    if (isDemoMode()) return;
    if (pendingExpenses.current) return pendingExpenses.current;
    const load = async () => {
    setLoading(true);
    try {
      const list: Expense[] = [];
      for (let page = 0; ; page++) {
        const data = await request<Expense[] | { content: Expense[]; last: boolean }>(`/expenses?page=${page}&size=100&sortBy=id&sortDir=DESC`);
        if (Array.isArray(data)) { list.push(...data); break; }
        list.push(...data.content);
        if (data.last || data.content.length === 0) break;
        if (page >= 99) throw new Error('This workspace has more than 10,000 records. Narrow the reporting period before loading.');
      }
      setExpenses(
        list.map((e) => ({
          ...e,
          amount: Number(e.amount),
          version: Number(e.version ?? 1),
          expenseDate: String(e.expenseDate),
        })),
      );
      setExpenseError('');
    } catch (error) {
      setExpenseError(error instanceof Error ? error.message : 'Unable to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
    };
    pendingExpenses.current = load().finally(() => { pendingExpenses.current = null; });
    return pendingExpenses.current;
  }, []);

  const refreshBudgets = useCallback(async () => {
    if (isDemoMode()) return;
    try {
      const data = await request<Budget[]>('/budgets');
      setBudgets(
        (Array.isArray(data) ? data : []).map((b) => ({
          ...b,
          limitAmount: Number(b.limitAmount),
          spentAmount: Number(b.spentAmount ?? 0),
          month: Number(b.month),
          year: Number(b.year),
          version: Number(b.version ?? 1),
        })),
      );
      setBudgetError('');
    } catch (error) {
      setBudgetError(error instanceof Error ? error.message : 'Unable to load budgets. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) { void refreshExpenses(); void refreshBudgets(); }
  }, [isAuthenticated, refreshExpenses, refreshBudgets]);

  const value = useMemo(
    () => ({
      loadError,
      loading,
      expenses,
      budgets,
      addExpense,
      updateExpense,
      deleteExpense,
      addBudget,
      updateBudget,
      deleteBudget,
      refreshExpenses,
      refreshBudgets,
      nextExpenseId,
      nextBudgetId,
    }),
    [
      loadError,
      loading,
      expenses,
      budgets,
      addExpense,
      updateExpense,
      deleteExpense,
      addBudget,
      updateBudget,
      deleteBudget,
      refreshExpenses,
      refreshBudgets,
      nextExpenseId,
      nextBudgetId,
    ],
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return ctx;
};
