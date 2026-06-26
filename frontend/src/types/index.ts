export type TransactionType = 'income' | 'expense'

export type PaymentMethod =
  | 'cash'
  | 'upi'
  | 'card'
  | 'netbanking'
  | 'wallet'
  | 'other'

export interface Income {
  id: number
  source: string
  amount: number
  date: string
  category: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: number
  name: string
  amount: number
  date: string
  category: string
  paymentMethod: PaymentMethod
  notes?: string
  tags?: string[]
  isRecurring?: boolean
  createdAt: string
  updatedAt: string
}

export type Transaction = (Income & { type: 'income' }) | (Expense & { type: 'expense' })

export interface DashboardStats {
  totalIncome: number
  totalExpense: number
  remainingBalance: number
  savings: number
  investment: number
  loanPayments: number
  emi: number
  currentMonthSpend: number
  previousMonthSpend: number
  savingsRate: number
  highestSpendingCategory: string
  highestSpendingAmount: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  count: number
}

export interface MonthlyData {
  month: string
  income: number
  expense: number
  savings: number
}

export interface DailySpending {
  date: string
  amount: number
  day: number
}

export interface AIInsight {
  id: string
  type: 'summary' | 'alert' | 'suggestion' | 'trend'
  title: string
  message: string
  score?: number
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface UserSettings {
  userName: string
  currency: string
  currencySymbol: string
  defaultIncome: number
  darkMode: boolean
  notifications: boolean
  budgetAlerts: boolean
  monthlySummary: boolean
  autoBackup: boolean
  exportFormat: string
  salaryDay: number
}

export interface ThemeConfig {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  cardColor: string
  fontFamily: string
  borderRadius: string
  isDark: boolean
}

export interface FilterState {
  search: string
  type: 'all' | 'income' | 'expense'
  categories: string[]
  dateFrom: string
  dateTo: string
  amountMin: number | null
  amountMax: number | null
  sortBy: 'date' | 'amount' | 'category'
  sortOrder: 'asc' | 'desc'
}

export interface ExportOptions {
  format: 'pdf' | 'xlsx' | 'csv' | 'json' | 'txt'
  dateFrom: string
  dateTo: string
  categories: string[]
  type: 'all' | 'income' | 'expense'
  includeCharts: boolean
  includeInsights: boolean
}

export interface BudgetGoal {
  id: string
  category: string
  limit: number
  spent: number
  month: string
}

export interface SavingsGoal {
  id: string
  name: string
  target: number
  current: number
  deadline?: string
}
