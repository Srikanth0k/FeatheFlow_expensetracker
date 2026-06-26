import axios from 'axios'
import type { Income as IncomeRecord, Expense as ExpenseRecord, UserSettings, PaymentMethod } from '../types'
import { API, environment } from '../config/environment'
import { getAuthToken, clearAuthToken } from './authToken'

// ─── Response types ───────────────────────────────────
export interface AuthUserResponse {
  id: number
  username: string
  email: string | null
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: AuthUserResponse
}

interface IncomeApiRecord {
  id: number
  source: string
  amount: number
  date: string
  category: string
  notes?: string | null
  created_at: string
  updated_at: string
}

interface ExpenseApiRecord {
  id: number
  name: string
  amount: number
  date: string
  category: string
  payment_method: string
  notes?: string | null
  tags?: string[] | null
  is_recurring?: boolean
  created_at: string
  updated_at: string
}

// ─── HTTP client ──────────────────────────────────────
const http = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuthToken()
    }
    return Promise.reject(error)
  }
)

// ─── Mappers ──────────────────────────────────────────
function mapIncomeFromApi(record: IncomeApiRecord): IncomeRecord {
  return {
    id: record.id,
    source: record.source,
    amount: record.amount,
    date: record.date,
    category: record.category,
    notes: record.notes ?? undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

function mapExpenseFromApi(record: ExpenseApiRecord): ExpenseRecord {
  return {
    id: record.id,
    name: record.name,
    amount: record.amount,
    date: record.date,
    category: record.category,
    paymentMethod: record.payment_method as PaymentMethod,
    notes: record.notes ?? undefined,
    tags: record.tags ?? undefined,
    isRecurring: record.is_recurring,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

type IncomeInput = Omit<IncomeRecord, 'id' | 'createdAt' | 'updatedAt'>
type ExpenseInput = Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>

function mapIncomeToApi(data: Partial<IncomeInput>) {
  return {
    source: data.source,
    amount: data.amount,
    date: data.date,
    category: data.category,
    notes: data.notes,
  }
}

function mapExpenseToApi(data: Partial<ExpenseInput>) {
  return {
    name: data.name,
    amount: data.amount,
    date: data.date,
    category: data.category,
    payment_method: data.paymentMethod,
    notes: data.notes,
    tags: data.tags,
    is_recurring: data.isRecurring,
  }
}

// ─── Health ───────────────────────────────────────────
export const Health = {
  url: API.Health.check,
  check: () => http.get(API.Health.check, { timeout: 3000 }),
}

export const isBackendAvailable = async (): Promise<boolean> => {
  if (environment.useLocalStorage) return false
  try {
    await Health.check()
    return true
  } catch {
    return false
  }
}

// ─── Auth ─────────────────────────────────────────────
export const Auth = {
  urls: API.Auth,

  register: (data: { username: string; email: string; password: string }) =>
    http.post<AuthResponse>(API.Auth.register, data),

  login: (data: { identifier: string; password: string }) =>
    http.post<AuthResponse>(API.Auth.login, data),

  me: () => http.get<AuthUserResponse>(API.Auth.me),

  updateProfile: (data: {
    username?: string
    email?: string
    current_password?: string
    new_password?: string
  }) => http.put<AuthUserResponse>(API.Auth.profile, data),

  forgotPassword: (email: string, newPassword: string, confirmPassword: string) =>
    http.post<{ message: string }>(API.Auth.forgotPassword, {
      email,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),

  clearDeviceToken: () => http.post(API.Auth.clearDeviceToken),
}

// ─── Income ───────────────────────────────────────────
export const Income = {
  urls: API.Income,

  addIncome: async (data: IncomeInput) => {
    const { data: record } = await http.post<IncomeApiRecord>(API.Income.addIncome, mapIncomeToApi(data))
    return mapIncomeFromApi(record)
  },

  getIncomes: async () => {
    const { data: records } = await http.get<IncomeApiRecord[]>(API.Income.getIncomes)
    return records.map(mapIncomeFromApi)
  },

  updateIncome: async (incomeId: number, data: Partial<IncomeInput>) => {
    const { data: record } = await http.put<IncomeApiRecord>(
      API.Income.updateIncome(incomeId),
      mapIncomeToApi(data)
    )
    return mapIncomeFromApi(record)
  },

  deleteIncome: (incomeId: number) => http.delete(API.Income.deleteIncome(incomeId)),
}

// ─── Expense ──────────────────────────────────────────
export const Expense = {
  urls: API.Expense,

  addExpense: async (data: ExpenseInput) => {
    const { data: record } = await http.post<ExpenseApiRecord>(API.Expense.addExpense, mapExpenseToApi(data))
    return mapExpenseFromApi(record)
  },

  getExpenses: async () => {
    const { data: records } = await http.get<ExpenseApiRecord[]>(API.Expense.getExpenses)
    return records.map(mapExpenseFromApi)
  },

  updateExpense: async (expenseId: number, data: Partial<ExpenseInput>) => {
    const { data: record } = await http.put<ExpenseApiRecord>(
      API.Expense.updateExpense(expenseId),
      mapExpenseToApi(data)
    )
    return mapExpenseFromApi(record)
  },

  deleteExpense: (expenseId: number) => http.delete(API.Expense.deleteExpense(expenseId)),
}

// ─── Analytics ────────────────────────────────────────
export const Analytics = {
  urls: API.Analytics,

  getDashboard: () => http.get(API.Analytics.dashboard),
  getMonthly: () => http.get(API.Analytics.monthly),
  getCategory: () => http.get(API.Analytics.category),
}

// ─── AI ───────────────────────────────────────────────
export const AI = {
  urls: API.AI,

  chat: (message: string) => http.post(API.AI.chat, { message }),
  getSummary: () => http.get(API.AI.summary),
}

// ─── Export ───────────────────────────────────────────
export const Export = {
  urls: API.Export,

  pdf: (options: unknown) => http.post(API.Export.pdf, options, { responseType: 'blob' }),
  excel: (options: unknown) => http.post(API.Export.excel, options, { responseType: 'blob' }),
  docx: (options: unknown) => http.post(API.Export.docx, options, { responseType: 'blob' }),
  csv: (options: unknown) => http.post(API.Export.csv, options, { responseType: 'blob' }),
}

// ─── Settings ─────────────────────────────────────────
export const Settings = {
  urls: API.Settings,

  get: () => http.get<UserSettings>(API.Settings.get),
  update: (data: Partial<UserSettings>) => http.put<UserSettings>(API.Settings.update, data),
}

export default http
