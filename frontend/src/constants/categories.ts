export const EXPENSE_CATEGORIES = [
  'Food',
  'Groceries',
  'Rent',
  'Fuel',
  'Transport',
  'Shopping',
  'Health',
  'Insurance',
  'EMI',
  'Investment',
  'Entertainment',
  'Travel',
  'Subscription',
  'Education',
  'Utilities',
  'Mobile Recharge',
  'Internet',
  'Family',
  'Gifts',
  'Other',
] as const

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Bonus',
  'Refund',
  'Interest',
  'Dividend',
  'Rental',
  'Business',
  'Other',
] as const

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'other', label: 'Other' },
] as const

export const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍔',
  Groceries: '🛒',
  Rent: '🏠',
  Fuel: '⛽',
  Transport: '🚌',
  Shopping: '🛍️',
  Health: '🏥',
  Insurance: '🛡️',
  EMI: '🏦',
  Investment: '📈',
  Entertainment: '🎬',
  Travel: '✈️',
  Subscription: '📱',
  Education: '📚',
  Utilities: '💡',
  'Mobile Recharge': '📞',
  Internet: '🌐',
  Family: '👨‍👩‍👧',
  Gifts: '🎁',
  Other: '📦',
  Salary: '💼',
  Freelancing: '💻',
  Bonus: '🎉',
  Refund: '↩️',
  Interest: '💰',
  Dividend: '📊',
  Rental: '🏘️',
  Business: '🏢',
}

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? '📦'
}

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f97316',
  Groceries: '#84cc16',
  Rent: '#6366f1',
  Fuel: '#eab308',
  Transport: '#06b6d4',
  Shopping: '#ec4899',
  Health: '#ef4444',
  Insurance: '#8b5cf6',
  EMI: '#f43f5e',
  Investment: '#10b981',
  Entertainment: '#a855f7',
  Travel: '#0ea5e9',
  Subscription: '#64748b',
  Education: '#3b82f6',
  Utilities: '#14b8a6',
  'Mobile Recharge': '#f59e0b',
  Internet: '#6366f1',
  Family: '#f472b6',
  Gifts: '#c084fc',
  Other: '#94a3b8',
  Salary: '#10b981',
  Freelancing: '#3b82f6',
  Bonus: '#f59e0b',
  Refund: '#06b6d4',
  Interest: '#8b5cf6',
  Dividend: '#14b8a6',
}

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
]

export const DEFAULT_SETTINGS = {
  userName: 'User',
  currency: 'INR',
  currencySymbol: '₹',
  defaultIncome: 0,
  darkMode: false,
  notifications: true,
  budgetAlerts: true,
  monthlySummary: false,
  autoBackup: false,
  exportFormat: 'pdf',
  salaryDay: 1,
}

export const DEFAULT_THEME: import('../types').ThemeConfig = {
  id: 'default-dark',
  name: 'Featherflow Dark',
  primaryColor: '#D4AF37',
  secondaryColor: '#5F6368',
  backgroundColor: '#121212',
  cardColor: '#1E1E1E',
  fontFamily: 'Inter',
  borderRadius: '8px',
  isDark: true,
}

export const LIGHT_THEME: import('../types').ThemeConfig = {
  id: 'default-light',
  name: 'Featherflow Light',
  primaryColor: '#D4AF37',
  secondaryColor: '#5F6368',
  backgroundColor: '#F8F9FA',
  cardColor: '#FFFFFF',
  fontFamily: 'Inter',
  borderRadius: '8px',
  isDark: false,
}
