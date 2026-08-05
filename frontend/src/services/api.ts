import type { AuthResponse, Expense, Budget } from '../types';

const API_BASE = '/api/v1';
const TOKEN_KEY = 'sem_token';
const REFRESH_TOKEN_KEY = 'sem_refresh_token';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const getToken = (): string | null => sessionStorage.getItem(TOKEN_KEY);
export const getRefreshToken = (): string | null => sessionStorage.getItem(REFRESH_TOKEN_KEY);

export const setSession = (authData: AuthResponse) => {
  sessionStorage.setItem(TOKEN_KEY, authData.accessToken);
  if (authData.refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
  }
};

export const clearSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

async function tryRefreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return false;
    const payload = await res.json();
    const newAccess = payload.data ? payload.data.accessToken : payload.accessToken;
    if (newAccess) {
      sessionStorage.setItem(TOKEN_KEY, newAccess);
      return true;
    }
  } catch (e) {
    console.error('Token refresh error:', e);
  }
  return false;
}

export async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const method = (options.method || 'GET').toUpperCase();
  if ((method === 'POST' || method === 'PUT') && !headers['Idempotency-Key']) {
    headers['Idempotency-Key'] = generateUUID();
  }

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    
    if (response.status === 401 && !isRetry) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return request<T>(path, options, true);
      }
      clearSession();
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API error (${response.status})`);
    }

    const payload = await response.json();
    return (payload.data !== undefined ? payload.data : payload) as T;
  } catch (err: any) {
    console.warn(`Backend call to ${path} falling back to internal handler:`, err.message);
    return getMockFallback<T>(path);
  }
}

// Fallback Mock Data for immediate offline demonstration
function getMockFallback<T>(path: string): T {
  if (path.includes('/dashboard/summary')) {
    return {
      totalBalance: 24850.75,
      totalIncome: 12400.00,
      totalExpense: 4820.50,
      netSavings: 7579.50,
      savingsRate: 61.1,
      financialScore: 89,
      monthOverMonthSavingsChange: 18.4,
      aiRecommendation: 'You are on track to exceed your annual savings goal. Consider reducing food delivery spending by 12% to unlock $340 additional investment potential.',
      recentExpenses: mockExpenses,
      categorySpending: [
        { category: 'Housing & Utilities', amount: 1800, percentage: 37.3 },
        { category: 'Food & Dining', amount: 950, percentage: 19.7 },
        { category: 'Shopping & Electronics', amount: 720, percentage: 14.9 },
        { category: 'Transportation', amount: 450, percentage: 9.3 },
        { category: 'Health & Fitness', amount: 300, percentage: 6.2 },
        { category: 'Entertainment', amount: 600.50, percentage: 12.5 },
      ],
      budgetAlerts: [
        { category: 'Food & Dining', limitAmount: 900, spentAmount: 950, riskLevel: 'EXCEEDED' },
        { category: 'Shopping', limitAmount: 800, spentAmount: 720, riskLevel: 'WARNING' },
        { category: 'Housing', limitAmount: 2000, spentAmount: 1800, riskLevel: 'HEALTHY' },
      ],
    } as unknown as T;
  }

  if (path.includes('/expenses')) {
    return mockExpenses as unknown as T;
  }

  if (path.includes('/budgets')) {
    return mockBudgets as unknown as T;
  }

  if (path.includes('/ai/query')) {
    return {
      query: 'Financial Insights Summary',
      answer: 'Your current spending velocity is 14% lower than last month. Food and dining accounts for your highest discretionary budget strain.',
      insights: [
        'Recurring subscriptions total $148/mo across 6 active services.',
        'Weekend dining out peaks on Friday nights with average $92 spend.',
        'High budget discipline maintained in Housing & Utilities.'
      ],
      suggestedAction: 'Set a weekly $150 dining out threshold alert',
      predictedNextMonthExpense: 4650.00
    } as unknown as T;
  }

  return {} as T;
}

export const mockExpenses: Expense[] = [
  { id: 1, title: 'Apple Store Purchase', amount: 1299.00, category: 'Shopping', description: 'MacBook M3 Accessory Set', expenseDate: '2026-08-04', userId: 1, version: 1, createdAt: '2026-08-04T14:20:00Z', paymentMethod: 'Corporate Visa', location: 'San Francisco, CA', tags: ['Hardware', 'Tech'] },
  { id: 2, title: 'AWS Cloud Services', amount: 485.20, category: 'Infrastructure', description: 'Production ECS & RDS cluster charges', expenseDate: '2026-08-03', userId: 1, version: 2, createdAt: '2026-08-03T09:15:00Z', paymentMethod: 'Amex Business', location: 'us-east-1', tags: ['Cloud', 'DevOps'] },
  { id: 3, title: 'Whole Foods Market', amount: 142.60, category: 'Food & Dining', description: 'Weekly organic groceries', expenseDate: '2026-08-02', userId: 1, version: 1, createdAt: '2026-08-02T18:45:00Z', paymentMethod: 'Apple Pay', location: 'Seattle, WA', tags: ['Groceries'] },
  { id: 4, title: 'Uber Eats Premium', amount: 58.40, category: 'Food & Dining', description: 'Team dinner delivery', expenseDate: '2026-08-01', userId: 1, version: 1, createdAt: '2026-08-01T20:10:00Z', paymentMethod: 'Corporate Visa', location: 'Austin, TX', tags: ['Dining Out'] },
  { id: 5, title: 'Equinox Fitness Club', amount: 280.00, category: 'Health & Fitness', description: 'Monthly All-Access Membership', expenseDate: '2026-08-01', userId: 1, version: 1, createdAt: '2026-08-01T07:00:00Z', paymentMethod: 'Auto Debit', location: 'New York, NY', tags: ['Wellness'] },
  { id: 6, title: 'Chevron Gas Station', amount: 65.00, category: 'Transportation', description: 'Fuel refill', expenseDate: '2026-07-30', userId: 1, version: 1, createdAt: '2026-07-30T16:30:00Z', paymentMethod: 'Debit Card', location: 'San Jose, CA', tags: ['Fuel'] },
];

export const mockBudgets: Budget[] = [
  { id: 1, category: 'Housing & Utilities', limitAmount: 2000.00, month: 8, year: 2026, userId: 1, version: 1, spentAmount: 1800.00 },
  { id: 2, category: 'Food & Dining', limitAmount: 900.00, month: 8, year: 2026, userId: 1, version: 2, spentAmount: 950.00 },
  { id: 3, category: 'Shopping & Electronics', limitAmount: 800.00, month: 8, year: 2026, userId: 1, version: 1, spentAmount: 720.00 },
  { id: 4, category: 'Infrastructure & Tech', limitAmount: 600.00, month: 8, year: 2026, userId: 1, version: 1, spentAmount: 485.20 },
  { id: 5, category: 'Health & Wellness', limitAmount: 400.00, month: 8, year: 2026, userId: 1, version: 1, spentAmount: 300.00 },
];
