import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Expense, Budget } from '../types';
import { mockExpenses, mockBudgets, request } from '../services/api';

interface ExpenseContextType {
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

const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  budgets: [],
  addExpense: () => {},
  updateExpense: () => {},
  deleteExpense: () => {},
  addBudget: () => {},
  updateBudget: () => {},
  deleteBudget: () => {},
  refreshExpenses: async () => {},
  refreshBudgets: async () => {},
  nextExpenseId: () => Date.now(),
  nextBudgetId: () => Date.now(),
});

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);

  const nextExpenseId = useCallback(() => Math.max(0, ...expenses.map(e => e.id)) + 1, [expenses]);
  const nextBudgetId = useCallback(() => Math.max(0, ...budgets.map(b => b.id)) + 1, [budgets]);

  const addExpense = useCallback((exp: Expense) => {
    setExpenses(prev => [exp, ...prev]);
  }, []);

  const updateExpense = useCallback((id: number, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates, version: e.version + 1 } : e));
  }, []);

  const deleteExpense = useCallback((id: number) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const addBudget = useCallback((b: Budget) => {
    setBudgets(prev => [b, ...prev]);
  }, []);

  const updateBudget = useCallback((id: number, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates, version: b.version + 1 } : b));
  }, []);

  const deleteBudget = useCallback((id: number) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  const refreshExpenses = useCallback(async () => {
    try {
      const data = await request<Expense[]>('/expenses');
      setExpenses(data);
    } catch {
      // silently keep local state
    }
  }, []);

  const refreshBudgets = useCallback(async () => {
    try {
      const data = await request<Budget[]>('/budgets');
      setBudgets(data);
    } catch {
      // silently keep local state
    }
  }, []);

  return (
    <ExpenseContext.Provider value={{
      expenses, budgets,
      addExpense, updateExpense, deleteExpense,
      addBudget, updateBudget, deleteBudget,
      refreshExpenses, refreshBudgets,
      nextExpenseId, nextBudgetId,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
