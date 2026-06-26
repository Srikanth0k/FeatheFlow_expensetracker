function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

function resolveBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL
    ? normalizeUrl(import.meta.env.VITE_API_URL)
    : ''

  // Production / preview builds call the API directly (set VITE_API_URL at build time).
  if (import.meta.env.PROD) {
    return configured || 'http://localhost:8000'
  }

  // Local dev: proxy /api → VITE_API_URL (or localhost:8000) via vite.config.ts.
  // Avoids CORS issues and guarantees .env is read by the dev server.
  return '/api'
}

const BASE_URL = resolveBaseUrl()

export const environment = {
  production: import.meta.env.PROD,
  baseUrl: BASE_URL,
  /** Remote API origin (for display/debug); dev requests still go through /api proxy. */
  remoteApiUrl: import.meta.env.VITE_API_URL
    ? normalizeUrl(import.meta.env.VITE_API_URL)
    : 'http://localhost:8000',
  useLocalStorage: import.meta.env.VITE_USE_LOCAL_STORAGE !== 'false',
}

if (import.meta.env.DEV && !environment.useLocalStorage) {
  console.info(
    `[Featherflow] API mode: backend\n` +
      `  Dev proxy: ${BASE_URL} → ${environment.remoteApiUrl}\n` +
      `  Restart "npm run dev" after changing frontend/.env`
  )
}

/** All API endpoints as full URLs: baseUrl + path */
export const API = {
  Health: {
    check: `${BASE_URL}/health`,
  },

  Auth: {
    register: `${BASE_URL}/auth/register`,
    login: `${BASE_URL}/auth/login`,
    me: `${BASE_URL}/auth/me`,
    profile: `${BASE_URL}/auth/profile`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    clearDeviceToken: `${BASE_URL}/auth/clear-device-token`,
  },

  Income: {
    addIncome: `${BASE_URL}/income/add-income`,
    getIncomes: `${BASE_URL}/income/get-incomes`,
    updateIncome: (incomeId: number) => `${BASE_URL}/income/update-income/${incomeId}`,
    deleteIncome: (incomeId: number) => `${BASE_URL}/income/delete-income/${incomeId}`,
  },

  Expense: {
    addExpense: `${BASE_URL}/expense/add-expense`,
    getExpenses: `${BASE_URL}/expense/get-expenses`,
    updateExpense: (expenseId: number) => `${BASE_URL}/expense/update-expense/${expenseId}`,
    deleteExpense: (expenseId: number) => `${BASE_URL}/expense/delete-expense/${expenseId}`,
  },

  Analytics: {
    dashboard: `${BASE_URL}/analytics/dashboard`,
    monthly: `${BASE_URL}/analytics/monthly`,
    category: `${BASE_URL}/analytics/category`,
  },

  AI: {
    chat: `${BASE_URL}/ai/chat`,
    summary: `${BASE_URL}/ai/summary`,
  },

  Export: {
    pdf: `${BASE_URL}/export/pdf`,
    excel: `${BASE_URL}/export/excel`,
    docx: `${BASE_URL}/export/docx`,
    csv: `${BASE_URL}/export/csv`,
    json: `${BASE_URL}/export/json`,
  },

  Settings: {
    get: `${BASE_URL}/settings`,
    update: `${BASE_URL}/settings`,
  },
} as const

export type ApiEndpoints = typeof API
