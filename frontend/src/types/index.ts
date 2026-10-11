export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  /** Spring AuthResponse field */
  token?: string;
  accessToken?: string;
  tokenType?: string;
  refreshToken: string;
  user?: User;
  /** Demo / legacy flat fields */
  userId?: number;
  email?: string;
  name?: string;
  role?: string;
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
  userId?: number;
  version?: number;
  spentAmount?: number;
}

export interface DashboardSummary {
  currentBalance?: number;
  totalBalance?: number;
  totalIncome?: number;
  totalExpenses?: number;
  totalExpense?: number;
  netSavings?: number;
  cashFlow?: number;
  budgetRemaining?: number;
  savingsRate?: number;
  financialScore?: number;
  monthOverMonthSavingsChange?: number;
  aiRecommendation?: string;
  recentExpenses?: Expense[];
  recentTransactions?: Expense[];
  categorySpending?: { category: string; amount: number; percentage: number }[];
  topSpendingCategories?: { category: string; amount: number; percentage: number }[];
  budgetAlerts?: { category: string; limitAmount: number; spentAmount: number; riskLevel: 'HEALTHY' | 'WARNING' | 'EXCEEDED' }[];
  monthlyTrend?: { month: string; income: number; expenses: number }[];
  weeklyTrend?: { dayOfWeek: string; amount: number }[];
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
