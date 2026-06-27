import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Income, Expense, FilterState, ChatMessage } from '../types'
import { generateId, getCurrentMonthRange } from '../utils/format'
import { Income as IncomeApi, Expense as ExpenseApi } from '../services/api'
import { hasAuthToken } from '../services/authToken'

interface FinanceState {
  incomes: Income[]
  expenses: Expense[]
  selectedIds: number[]
  filters: FilterState
  chatMessages: ChatMessage[]
  isLoading: boolean

  fetchTransactions: () => Promise<void>
  resetTransactions: () => void
  addIncome: (data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateIncome: (id: number, data: Partial<Income>) => Promise<void>
  deleteIncome: (id: number) => Promise<void>
  duplicateIncome: (id: number) => Promise<void>

  addExpense: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateExpense: (id: number, data: Partial<Expense>) => Promise<void>
  deleteExpense: (id: number) => Promise<void>
  duplicateExpense: (id: number) => Promise<void>

  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void

  toggleSelect: (id: number) => void
  selectAll: (ids: number[]) => void
  clearSelection: () => void
  bulkDelete: () => Promise<void>

  addChatMessage: (role: 'user' | 'assistant', content: string) => void
  clearChat: () => void

  importData: (incomes: Income[], expenses: Expense[]) => void
}

const defaultFilters: FilterState = {
  search: '',
  type: 'all',
  categories: [],
  dateFrom: getCurrentMonthRange().from,
  dateTo: getCurrentMonthRange().to,
  amountMin: null,
  amountMax: null,
  sortBy: 'date',
  sortOrder: 'desc',
}

/** Use backend API only when a login token is present. */
function shouldUseApi(): boolean {
  return hasAuthToken()
}

let fetchPromise: Promise<void> | null = null

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      incomes: [],
      expenses: [],
      selectedIds: [],
      filters: defaultFilters,
      chatMessages: [],
      isLoading: false,

      fetchTransactions: async () => {
        if (!shouldUseApi()) return
        if (fetchPromise) return fetchPromise

        fetchPromise = (async () => {
          set({ isLoading: true })
          try {
            const [incomes, expenses] = await Promise.all([
              IncomeApi.getIncomes(),
              ExpenseApi.getExpenses(),
            ])
            set({ incomes, expenses })
          } catch {
            // Leave existing transactions visible if the sync request fails.
          } finally {
            set({ isLoading: false })
            fetchPromise = null
          }
        })()

        return fetchPromise
      },

      resetTransactions: () => {
        fetchPromise = null
        set({ incomes: [], expenses: [], selectedIds: [] })
      },

      addIncome: async (data) => {
        set({ isLoading: true })
        try {
          if (shouldUseApi()) {
            const income = await IncomeApi.addIncome(data)
            set((s) => ({ incomes: [income, ...s.incomes] }))
            return
          }
          const now = new Date().toISOString()
          const income: Income = { ...data, id: Date.now(), createdAt: now, updatedAt: now }
          set((s) => ({ incomes: [income, ...s.incomes] }))
        } catch (err) {
          throw err instanceof Error ? err : new Error('Failed to add income')
        } finally {
          set({ isLoading: false })
        }
      },

      updateIncome: async (id, data) => {
        set({ isLoading: true })
        try {
          if (shouldUseApi()) {
            const income = await IncomeApi.updateIncome(id, data)
            set((s) => ({
              incomes: s.incomes.map((i) => (i.id === id ? income : i)),
            }))
            return
          }
          set((s) => ({
            incomes: s.incomes.map((i) =>
              i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i
            ),
          }))
        } catch (err) {
          throw err instanceof Error ? err : new Error('Failed to update income')
        } finally {
          set({ isLoading: false })
        }
      },

      deleteIncome: async (id) => {
        set({ isLoading: true })
        try {
          if (shouldUseApi()) await IncomeApi.deleteIncome(id)
          set((s) => ({
            incomes: s.incomes.filter((i) => i.id !== id),
            selectedIds: s.selectedIds.filter((sid) => sid !== id),
          }))
        } catch (err) {
          throw err instanceof Error ? err : new Error('Failed to delete income')
        } finally {
          set({ isLoading: false })
        }
      },

      duplicateIncome: async (id) => {
        const original = get().incomes.find((i) => i.id === id)
        if (!original) return
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = original
        await get().addIncome(rest)
      },

      addExpense: async (data) => {
        set({ isLoading: true })
        try {
          if (shouldUseApi()) {
            const expense = await ExpenseApi.addExpense(data)
            set((s) => ({ expenses: [expense, ...s.expenses] }))
            return
          }
          const now = new Date().toISOString()
          const expense: Expense = { ...data, id: Date.now(), createdAt: now, updatedAt: now }
          set((s) => ({ expenses: [expense, ...s.expenses] }))
        } catch (err) {
          throw err instanceof Error ? err : new Error('Failed to add expense')
        } finally {
          set({ isLoading: false })
        }
      },

      updateExpense: async (id, data) => {
        set({ isLoading: true })
        try {
          if (shouldUseApi()) {
            const expense = await ExpenseApi.updateExpense(id, data)
            set((s) => ({
              expenses: s.expenses.map((e) => (e.id === id ? expense : e)),
            }))
            return
          }
          set((s) => ({
            expenses: s.expenses.map((e) =>
              e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
            ),
          }))
        } catch (err) {
          throw err instanceof Error ? err : new Error('Failed to update expense')
        } finally {
          set({ isLoading: false })
        }
      },

      deleteExpense: async (id) => {
        set({ isLoading: true })
        try {
          if (shouldUseApi()) await ExpenseApi.deleteExpense(id)
          set((s) => ({
            expenses: s.expenses.filter((e) => e.id !== id),
            selectedIds: s.selectedIds.filter((sid) => sid !== id),
          }))
        } catch (err) {
          throw err instanceof Error ? err : new Error('Failed to delete expense')
        } finally {
          set({ isLoading: false })
        }
      },

      duplicateExpense: async (id) => {
        const original = get().expenses.find((e) => e.id === id)
        if (!original) return
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = original
        await get().addExpense(rest)
      },

      setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
      resetFilters: () => set({ filters: defaultFilters }),

      toggleSelect: (id) =>
        set((s) => ({
          selectedIds: s.selectedIds.includes(id)
            ? s.selectedIds.filter((sid) => sid !== id)
            : [...s.selectedIds, id],
        })),

      selectAll: (ids) => set({ selectedIds: ids }),
      clearSelection: () => set({ selectedIds: [] }),

      bulkDelete: async () => {
        const { selectedIds, incomes, expenses } = get()
        set({ isLoading: true })
        try {
          if (shouldUseApi()) {
            await Promise.all([
              ...incomes.filter((i) => selectedIds.includes(i.id)).map((i) => IncomeApi.deleteIncome(i.id)),
              ...expenses.filter((e) => selectedIds.includes(e.id)).map((e) => ExpenseApi.deleteExpense(e.id)),
            ])
          }
          set((s) => ({
            incomes: s.incomes.filter((i) => !selectedIds.includes(i.id)),
            expenses: s.expenses.filter((e) => !selectedIds.includes(e.id)),
            selectedIds: [],
          }))
        } catch (err) {
          throw err instanceof Error ? err : new Error('Failed to delete transactions')
        } finally {
          set({ isLoading: false })
        }
      },

      addChatMessage: (role, content) => {
        const msg: ChatMessage = {
          id: generateId(),
          role,
          content,
          timestamp: new Date().toISOString(),
        }
        set((s) => ({ chatMessages: [...s.chatMessages, msg] }))
      },

      clearChat: () => set({ chatMessages: [] }),

      importData: (incomes, expenses) => set({ incomes, expenses }),
    }),
    {
      name: 'finflow-finance',
      partialize: (state) => ({
        chatMessages: state.chatMessages,
        filters: state.filters,
      }),
    }
  )
)
