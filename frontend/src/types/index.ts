export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
  role: string;
  refreshToken: string;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  description?: string;
  expenseDate: string;
  userId: number;
  version: number;
  createdAt: string;
  paymentMethod?: string;
  merchantIcon?: string;
  location?: string;
  tags?: string[];
}

export interface Income {
  id: number;
  source: string;
  amount: number;
  description?: string;
  incomeDate: string;
  userId: number;
  createdAt: string;
}

export interface Budget {
  id: number;
  category: string;
  limitAmount: number;
  month: number;
  year: number;
  userId: number;
  version: number;
  spentAmount?: number;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  financialScore: number;
  monthOverMonthSavingsChange: number;
  aiRecommendation: string;
  recentExpenses: Expense[];
  categorySpending: { category: string; amount: number; percentage: number }[];
  budgetAlerts: { category: string; limitAmount: number; spentAmount: number; riskLevel: 'HEALTHY' | 'WARNING' | 'EXCEEDED' }[];
}

export interface AiQueryResult {
  query: string;
  answer: string;
  insights: string[];
  suggestedAction?: string;
  predictedNextMonthExpense?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
  timestamp: string;
  read: boolean;
}
