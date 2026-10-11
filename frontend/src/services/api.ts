import type { AuthResponse, Expense, Budget, User } from '../types';

const API_BASE = '/api/v1';
const TOKEN_KEY = 'sem_token';
const REFRESH_TOKEN_KEY = 'sem_refresh_token';

/** Demo/offline fallbacks only when explicitly enabled (Vite env or ?demo=1). */
export function isDemoMode(): boolean {
  if (import.meta.env?.VITE_USE_MOCK === 'true') return true;
  if (typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search).get('demo') === '1';
  }
  return false;
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const getToken = (): string | null => sessionStorage.getItem(TOKEN_KEY);
export const getRefreshToken = (): string | null => sessionStorage.getItem(REFRESH_TOKEN_KEY);

export function normalizeAuth(raw: AuthResponse): { accessToken: string; refreshToken: string; user: User } {
  const accessToken = raw.accessToken || raw.token || '';
  const user: User = raw.user
    ? {
        id: raw.user.id,
        name: raw.user.name,
        email: raw.user.email,
        role: raw.user.role,
      }
    : {
        id: raw.userId ?? 0,
        name: raw.name ?? 'User',
        email: raw.email ?? '',
        role: raw.role ?? 'USER',
      };
  return { accessToken, refreshToken: raw.refreshToken, user };
}

export const setSession = (authData: AuthResponse) => {
  const session = normalizeAuth(authData);
  sessionStorage.setItem(TOKEN_KEY, session.accessToken);
  if (session.refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  }
};

export const clearSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem('sem_user');
  window.dispatchEvent(new Event('sem:session-expired'));
};

/** Clear locally immediately and attempt server refresh-token revocation without refreshing. */
export function endSession(): void {
  const token = getToken();
  const live = !isDemoMode();
  clearSession();
  if (live && token) {
    void fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => { /* Local sign-out still works when the API is unavailable. */ });
  }
}

let refreshInFlight: Promise<boolean> | null = null;

function tryRefreshToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshToken().finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

async function refreshToken(): Promise<boolean> {
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
    const inner = payload.data ?? payload;
    // Ignore a refresh response if the user signed out or changed accounts while it ran.
    if (getRefreshToken() !== refresh) return false;
    const newAccess = inner.accessToken || inner.token;
    if (newAccess) {
      sessionStorage.setItem(TOKEN_KEY, newAccess);
      if (inner.refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, inner.refreshToken);
      }
      return true;
    }
  } catch (e) {
    console.error('Token refresh error:', e);
  }
  return false;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  // Explicit demo sessions never send fake credentials or mutations to the live API.
  if (isDemoMode()) return getMockFallback<T>(path);
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const anonymous = /^\/auth\/(login|register|refresh|forgot-password|reset-password)(?:\?|$)/.test(path);

  const method = (options.method || 'GET').toUpperCase();
  if ((method === 'POST' || method === 'PUT') && !headers.has('Idempotency-Key')) {
    headers.set('Idempotency-Key', generateUUID());
  }

  const token = getToken();
  if (token && !anonymous) {
    headers.set('Authorization', `Bearer ${token}`);
  }

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (response.status === 401 && !anonymous && !isRetry) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return request<T>(path, { ...options, headers }, true);
      }
      if (getToken() && getToken() !== token) {
        throw new ApiError('Your account changed while this request was running. Please try again.', 409);
      }
      clearSession();
      throw new ApiError('Session expired. Please sign in again.', 401);
    }

    if (!response.ok) {
      const errorText = await response.text();
      let message = `Unable to complete the request (${response.status}).`;
      try {
        const error = JSON.parse(errorText);
        if (typeof error.message === 'string') message = error.message;
      } catch { /* Avoid displaying raw HTML gateway error pages. */ }
      if (response.status === 401 && !anonymous) clearSession();
      throw new ApiError(message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = await response.json();
    return (payload.data !== undefined ? payload.data : payload) as T;
}

function getMockFallback<T>(path: string): T {
  if (path.includes('/dashboard/summary')) {
    return {
      totalBalance: 24850.75,
      totalIncome: 12400.0,
      totalExpense: 4820.5,
      netSavings: 7579.5,
      savingsRate: 61.1,
      financialScore: 89,
      monthOverMonthSavingsChange: 18.4,
      aiRecommendation:
        'You are on track to exceed your annual savings goal. Consider reducing food delivery spending by 12% to unlock $340 additional investment potential.',
      recentExpenses: mockExpenses,
      categorySpending: [
        { category: 'Housing & Utilities', amount: 1800, percentage: 37.3 },
        { category: 'Food & Dining', amount: 950, percentage: 19.7 },
        { category: 'Shopping & Electronics', amount: 720, percentage: 14.9 },
        { category: 'Transportation', amount: 450, percentage: 9.3 },
        { category: 'Health & Fitness', amount: 300, percentage: 6.2 },
        { category: 'Entertainment', amount: 600.5, percentage: 12.5 },
      ],
      budgetAlerts: [
        { category: 'Food & Dining', limitAmount: 900, spentAmount: 950, riskLevel: 'EXCEEDED' },
        { category: 'Shopping', limitAmount: 800, spentAmount: 720, riskLevel: 'WARNING' },
        { category: 'Housing', limitAmount: 2000, spentAmount: 1800, riskLevel: 'HEALTHY' },
      ],
    } as unknown as T;
  }

  if (path.includes('/auth/login') || path.includes('/auth/register')) {
    return {
      token: `demo_jwt_${Date.now()}`,
      tokenType: 'Bearer',
      refreshToken: `demo_refresh_${Date.now()}`,
      user: {
        id: 1,
        name: 'Demo Admin',
        email: 'demo@smartexpense.com',
        role: 'ADMIN',
      },
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
      answer:
        'Your current spending velocity is 14% lower than last month. Food and dining accounts for your highest discretionary budget strain.',
      insights: [
        'Recurring subscriptions total $148/mo across 6 active services.',
        'Weekend dining out peaks on Friday nights with average $92 spend.',
        'High budget discipline maintained in Housing & Utilities.',
      ],
      suggestedAction: 'Set a weekly $150 dining out threshold alert',
      predictedNextMonthExpense: 4650.0,
    } as unknown as T;
  }

  return {} as T;
}

export const mockExpenses: Expense[] = [
  {
    id: 1,
    title: 'Apple Store Purchase',
    amount: 1299.0,
    category: 'Shopping',
    description: 'MacBook M3 Accessory Set',
    expenseDate: '2026-08-04',
    userId: 1,
    version: 1,
    createdAt: '2026-08-04T14:20:00Z',
    paymentMethod: 'Corporate Visa',
    location: 'San Francisco, CA',
    tags: ['Hardware', 'Tech'],
  },
  {
    id: 2,
    title: 'AWS Cloud Services',
    amount: 485.2,
    category: 'Infrastructure',
    description: 'Production ECS & RDS cluster charges',
    expenseDate: '2026-08-03',
    userId: 1,
    version: 2,
    createdAt: '2026-08-03T09:15:00Z',
    paymentMethod: 'Amex Business',
    location: 'us-east-1',
    tags: ['Cloud', 'DevOps'],
  },
  {
    id: 3,
    title: 'Whole Foods Market',
    amount: 142.6,
    category: 'Food & Dining',
    description: 'Weekly organic groceries',
    expenseDate: '2026-08-02',
    userId: 1,
    version: 1,
    createdAt: '2026-08-02T18:45:00Z',
    paymentMethod: 'Apple Pay',
    location: 'Seattle, WA',
    tags: ['Groceries'],
  },
  {
    id: 4,
    title: 'Uber Eats Premium',
    amount: 58.4,
    category: 'Food & Dining',
    description: 'Team dinner delivery',
    expenseDate: '2026-08-01',
    userId: 1,
    version: 1,
    createdAt: '2026-08-01T20:10:00Z',
    paymentMethod: 'Corporate Visa',
    location: 'Austin, TX',
    tags: ['Dining Out'],
  },
  {
    id: 5,
    title: 'Equinox Fitness Club',
    amount: 280.0,
    category: 'Health & Fitness',
    description: 'Monthly All-Access Membership',
    expenseDate: '2026-08-01',
    userId: 1,
    version: 1,
    createdAt: '2026-08-01T07:00:00Z',
    paymentMethod: 'Auto Debit',
    location: 'New York, NY',
    tags: ['Wellness'],
  },
  {
    id: 6,
    title: 'Chevron Gas Station',
    amount: 65.0,
    category: 'Transportation',
    description: 'Fuel refill',
    expenseDate: '2026-07-30',
    userId: 1,
    version: 1,
    createdAt: '2026-07-30T16:30:00Z',
    paymentMethod: 'Debit Card',
    location: 'San Jose, CA',
    tags: ['Fuel'],
  },
];

export const mockBudgets: Budget[] = [
  {
    id: 1,
    category: 'Housing & Utilities',
    limitAmount: 2000.0,
    month: 8,
    year: 2026,
    userId: 1,
    version: 1,
    spentAmount: 1800.0,
  },
  {
    id: 2,
    category: 'Food & Dining',
    limitAmount: 900.0,
    month: 8,
    year: 2026,
    userId: 1,
    version: 2,
    spentAmount: 950.0,
  },
  {
    id: 3,
    category: 'Shopping & Electronics',
    limitAmount: 800.0,
    month: 8,
    year: 2026,
    userId: 1,
    version: 1,
    spentAmount: 720.0,
  },
  {
    id: 4,
    category: 'Infrastructure & Tech',
    limitAmount: 600.0,
    month: 8,
    year: 2026,
    userId: 1,
    version: 1,
    spentAmount: 485.2,
  },
  {
    id: 5,
    category: 'Health & Wellness',
    limitAmount: 400.0,
    month: 8,
    year: 2026,
    userId: 1,
    version: 1,
    spentAmount: 300.0,
  },
];
