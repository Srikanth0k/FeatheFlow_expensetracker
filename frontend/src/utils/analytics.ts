import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  eachDayOfInterval,
} from 'date-fns'
import type { Income, Expense, DashboardStats, CategoryBreakdown, MonthlyData, DailySpending } from '../types'
import { isInDateRange } from './format'

export function filterByMonth<T extends { date: string }>(items: T[], monthOffset = 0): T[] {
  const target = subMonths(new Date(), -monthOffset)
  const from = format(startOfMonth(target), 'yyyy-MM-dd')
  const to = format(endOfMonth(target), 'yyyy-MM-dd')
  return items.filter((item) => isInDateRange(item.date, from, to))
}

export function calculateDashboardStats(
  incomes: Income[],
  expenses: Expense[]
): DashboardStats {
  const currentIncomes = filterByMonth(incomes)
  const currentExpenses = filterByMonth(expenses)
  const prevExpenses = filterByMonth(expenses, -1)

  const totalIncome = currentIncomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = currentExpenses.reduce((s, e) => s + e.amount, 0)
  const remainingBalance = totalIncome - totalExpense

  const savings = currentExpenses
    .filter((e) => e.category === 'Investment')
    .reduce((s, e) => s + e.amount, 0)

  const investment = savings
  const loanPayments = currentExpenses
    .filter((e) => ['EMI', 'Insurance'].includes(e.category))
    .reduce((s, e) => s + e.amount, 0)

  const emi = currentExpenses
    .filter((e) => e.category === 'EMI')
    .reduce((s, e) => s + e.amount, 0)

  const categoryMap = new Map<string, number>()
  currentExpenses.forEach((e) => {
    categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount)
  })

  let highestSpendingCategory = 'None'
  let highestSpendingAmount = 0
  categoryMap.forEach((amount, category) => {
    if (amount > highestSpendingAmount) {
      highestSpendingAmount = amount
      highestSpendingCategory = category
    }
  })

  return {
    totalIncome,
    totalExpense,
    remainingBalance,
    savings: totalIncome - totalExpense - investment,
    investment,
    loanPayments,
    emi,
    currentMonthSpend: totalExpense,
    previousMonthSpend: prevExpenses.reduce((s, e) => s + e.amount, 0),
    savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
    highestSpendingCategory,
    highestSpendingAmount,
  }
}

export function getCategoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const map = new Map<string, { amount: number; count: number }>()

  expenses.forEach((e) => {
    const existing = map.get(e.category) || { amount: 0, count: 0 }
    map.set(e.category, { amount: existing.amount + e.amount, count: existing.count + 1 })
  })

  return Array.from(map.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? Math.round((data.amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function getMonthlyTrend(
  incomes: Income[],
  expenses: Expense[],
  months = 6
): MonthlyData[] {
  const result: MonthlyData[] = []

  for (let i = months - 1; i >= 0; i--) {
    const target = subMonths(new Date(), i)
    const monthLabel = format(target, 'MMM yy')
    const monthIncomes = filterByMonth(incomes, -i)
    const monthExpenses = filterByMonth(expenses, -i)
    const income = monthIncomes.reduce((s, x) => s + x.amount, 0)
    const expense = monthExpenses.reduce((s, x) => s + x.amount, 0)

    result.push({
      month: monthLabel,
      income,
      expense,
      savings: income - expense,
    })
  }

  return result
}

export function getDailySpending(expenses: Expense[]): DailySpending[] {
  const now = new Date()
  const days = eachDayOfInterval({
    start: startOfMonth(now),
    end: endOfMonth(now),
  })

  const map = new Map<string, number>()
  expenses.forEach((e) => {
    if (isInDateRange(e.date, format(startOfMonth(now), 'yyyy-MM-dd'), format(endOfMonth(now), 'yyyy-MM-dd'))) {
      map.set(e.date, (map.get(e.date) || 0) + e.amount)
    }
  })

  return days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return {
      date: dateStr,
      day: day.getDate(),
      amount: map.get(dateStr) || 0,
    }
  })
}

export function getBudgetHealthScore(stats: DashboardStats): number {
  let score = 50

  if (stats.savingsRate >= 30) score += 25
  else if (stats.savingsRate >= 20) score += 15
  else if (stats.savingsRate >= 10) score += 5
  else score -= 10

  if (stats.remainingBalance > 0) score += 15
  else score -= 20

  const spendChange =
    stats.previousMonthSpend > 0
      ? ((stats.currentMonthSpend - stats.previousMonthSpend) / stats.previousMonthSpend) * 100
      : 0

  if (spendChange < 0) score += 10
  else if (spendChange > 20) score -= 15

  return Math.max(0, Math.min(100, score))
}

export function getFinancialHealthScore(stats: DashboardStats): number {
  let score = 40

  if (stats.savingsRate >= 20) score += 20
  if (stats.investment > 0) score += 15
  if (stats.remainingBalance > stats.totalIncome * 0.1) score += 15
  if (stats.emi / (stats.totalIncome || 1) < 0.3) score += 10

  return Math.max(0, Math.min(100, score))
}
