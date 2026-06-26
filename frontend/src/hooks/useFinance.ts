import { useMemo } from 'react'
import { useFinanceStore } from '../stores/useFinanceStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import {
  calculateDashboardStats,
  getCategoryBreakdown,
  getMonthlyTrend,
  getDailySpending,
  filterByMonth,
} from '../utils/analytics'
import { isInDateRange } from '../utils/format'
import type { Income, Expense } from '../types'

export function useFinance() {
  const incomes = useFinanceStore((s) => s.incomes)
  const expenses = useFinanceStore((s) => s.expenses)
  const filters = useFinanceStore((s) => s.filters)
  const currencySymbol = useSettingsStore((s) => s.currencySymbol)

  const stats = useMemo(() => calculateDashboardStats(incomes, expenses), [incomes, expenses])

  const currentMonthExpenses = useMemo(() => filterByMonth(expenses), [expenses])
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(currentMonthExpenses), [currentMonthExpenses])
  const monthlyTrend = useMemo(() => getMonthlyTrend(incomes, expenses), [incomes, expenses])
  const dailySpending = useMemo(() => getDailySpending(expenses), [expenses])

  const filteredTransactions = useMemo(() => {
    const { search, type, categories, dateFrom, dateTo, amountMin, amountMax, sortBy, sortOrder } = filters

    let items: Array<(Income & { type: 'income' }) | (Expense & { type: 'expense' })> = []

    if (type === 'all' || type === 'income') {
      items = [...items, ...incomes.map((i) => ({ ...i, type: 'income' as const }))]
    }
    if (type === 'all' || type === 'expense') {
      items = [...items, ...expenses.map((e) => ({ ...e, type: 'expense' as const }))]
    }

    if (search) {
      const q = search.toLowerCase()
      items = items.filter((item) => {
        const name = item.type === 'income' ? item.source : item.name
        return (
          name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.notes || '').toLowerCase().includes(q)
        )
      })
    }

    if (categories.length > 0) {
      items = items.filter((item) => categories.includes(item.category))
    }

    items = items.filter((item) => isInDateRange(item.date, dateFrom, dateTo))

    if (amountMin !== null) items = items.filter((item) => item.amount >= amountMin)
    if (amountMax !== null) items = items.filter((item) => item.amount <= amountMax)

    items.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'date') cmp = a.date.localeCompare(b.date)
      else if (sortBy === 'amount') cmp = a.amount - b.amount
      else cmp = a.category.localeCompare(b.category)
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return items
  }, [incomes, expenses, filters])

  return {
    incomes,
    expenses,
    stats,
    categoryBreakdown,
    monthlyTrend,
    dailySpending,
    filteredTransactions,
    currencySymbol,
  }
}
