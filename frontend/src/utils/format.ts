import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns'

export function formatCurrency(amount: number, symbol = '₹'): string {
  return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatDate(date: string): string {
  try {
    return format(parseISO(date), 'dd MMM yyyy')
  } catch {
    return date
  }
}

export function formatShortDate(date: string): string {
  try {
    return format(parseISO(date), 'dd MMM')
  } catch {
    return date
  }
}

export function formatMonthYear(date: Date = new Date()): string {
  return format(date, 'MMMM yyyy')
}

export function getCurrentMonthRange(): { from: string; to: string } {
  const now = new Date()
  return {
    from: format(startOfMonth(now), 'yyyy-MM-dd'),
    to: format(endOfMonth(now), 'yyyy-MM-dd'),
  }
}

export function getPreviousMonthRange(): { from: string; to: string } {
  const prev = subMonths(new Date(), 1)
  return {
    from: format(startOfMonth(prev), 'yyyy-MM-dd'),
    to: format(endOfMonth(prev), 'yyyy-MM-dd'),
  }
}

export function isInDateRange(date: string, from: string, to: string): boolean {
  try {
    const d = parseISO(date)
    return isWithinInterval(d, { start: parseISO(from), end: parseISO(to) })
  } catch {
    return true
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getPercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export function formatDayHeader(date: string): string {
  try {
    return format(parseISO(date), 'EEE, dd MMM')
  } catch {
    return date
  }
}

export function formatMonthYearFromDate(date: Date): string {
  return format(date, 'MMMM yyyy')
}

export function formatYear(date: Date): string {
  return format(date, 'yyyy')
}

export function getSavingsRate(income: number, expense: number): number {
  if (income === 0) return 0
  return Math.round(((income - expense) / income) * 100)
}
