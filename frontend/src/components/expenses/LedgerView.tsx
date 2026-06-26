import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Edit2, Trash2, LayoutGrid, List, ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  addDays,
  subDays,
  startOfYear,
  endOfYear,
  addYears,
  subYears,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from 'date-fns'
import { Button } from '../ui/Button'
import { useFinanceStore } from '../../stores/useFinanceStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useIsMdUp } from '../../hooks/useMediaQuery'
import { formatAmount, formatDayHeader, formatMonthYearFromDate, formatYear, formatDate } from '../../utils/format'
import { getCategoryIcon } from '../../constants/categories'
import { cn } from '../../utils/cn'
import type { Income, Expense } from '../../types'

type Period = 'daily' | 'monthly' | 'yearly'
type ViewMode = 'ledger' | 'cards'

interface LedgerViewProps {
  onEditIncome?: (item: Income) => void
  onEditExpense?: (item: Expense) => void
  onDeleteIncome?: (id: number) => void
  onDeleteExpense?: (id: number) => void
  onAddTransaction?: () => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  hideViewToggleOnDesktop?: boolean
  className?: string
}

function EmptyLedgerState({ onAddTransaction }: { onAddTransaction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-[var(--color-border)]/60 bg-[var(--color-surface-subtle)]/50">
      <p className="text-sm text-[var(--color-text-muted)] mb-6 text-center">
        No transactions yet. Add your first transaction to get started.
      </p>
      {onAddTransaction && (
        <Button onClick={onAddTransaction}>
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      )}
    </div>
  )
}

function getPeriodRange(period: Period, cursor: Date): { from: Date; to: Date; label: string } {
  if (period === 'daily') {
    const dayStart = startOfDay(cursor)
    return {
      from: dayStart,
      to: endOfDay(cursor),
      label: formatDayHeader(format(dayStart, 'yyyy-MM-dd')),
    }
  }
  if (period === 'monthly') {
    return {
      from: startOfMonth(cursor),
      to: endOfMonth(cursor),
      label: formatMonthYearFromDate(cursor),
    }
  }
  return {
    from: startOfYear(cursor),
    to: endOfYear(cursor),
    label: formatYear(cursor),
  }
}

function inPeriod(dateStr: string, from: Date, to: Date): boolean {
  try {
    const d = parseISO(dateStr)
    return isWithinInterval(d, { start: from, end: to })
  } catch {
    return false
  }
}

function IncomeLedgerRow({
  item,
  symbol,
  showDate,
  onEdit,
  onDelete,
}: {
  item: Income
  symbol: string
  showDate?: boolean
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <div className="group grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 sm:gap-3 py-2.5 px-2 sm:px-3 text-sm border-b border-[var(--color-border)]/20 last:border-0 min-h-[52px]">
      <div className="hidden md:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[var(--color-text)] truncate font-medium">{item.source}</p>
        {showDate && (
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{formatDate(item.date)}</p>
        )}
        <p className="md:hidden text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">{item.category}</p>
      </div>
      <div className="hidden md:block">
        <CategoryPill category={item.category} />
      </div>
      <div className="flex items-center gap-1 shrink-0 justify-end">
        <span className="font-semibold tabular-nums text-sm text-emerald-600 dark:text-emerald-400">
          +{symbol}{formatAmount(item.amount)}
        </span>
        {(onEdit || onDelete) && (
          <div className="flex md:hidden items-center gap-0.5 ml-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 rounded hover:bg-[var(--color-surface-active)] text-[var(--color-text-muted)]"
                aria-label="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-500/10 text-red-400" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        {(onEdit || onDelete) && (
          <div className="hidden md:group-hover:flex items-center gap-0.5 ml-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 rounded hover:bg-[var(--color-surface-active)] text-[var(--color-text-muted)]"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-1 rounded hover:bg-red-500/10 text-red-400">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ExpenseLedgerRow({
  item,
  symbol,
  showDate,
  onEdit,
  onDelete,
}: {
  item: Expense
  symbol: string
  showDate?: boolean
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <div className="group grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 sm:gap-3 py-2.5 px-2 sm:px-3 text-sm border-b border-[var(--color-border)]/20 last:border-0 min-h-[52px]">
      <div className="hidden md:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-500">
        <ArrowDownLeft className="h-3.5 w-3.5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[var(--color-text)] truncate font-medium">{item.name}</p>
        {showDate && (
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{formatDate(item.date)}</p>
        )}
        <p className="md:hidden text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">{item.category}</p>
      </div>
      <div className="hidden md:block">
        <CategoryPill category={item.category} />
      </div>
      <div className="flex items-center gap-1 shrink-0 justify-end">
        <span className="font-semibold tabular-nums text-sm text-red-600 dark:text-red-400">
          −{symbol}{formatAmount(item.amount)}
        </span>
        {(onEdit || onDelete) && (
          <div className="flex md:hidden items-center gap-0.5 ml-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 rounded hover:bg-[var(--color-surface-active)] text-[var(--color-text-muted)]"
                aria-label="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-500/10 text-red-400" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        {(onEdit || onDelete) && (
          <div className="hidden md:group-hover:flex items-center gap-0.5 ml-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 rounded hover:bg-[var(--color-surface-active)] text-[var(--color-text-muted)]"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-1 rounded hover:bg-red-500/10 text-red-400">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryPill({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)]/60 bg-[var(--color-surface-2)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)] shrink-0 max-w-[140px]">
      <span aria-hidden>{getCategoryIcon(category)}</span>
      <span className="truncate">{category}</span>
    </span>
  )
}

function PeriodLedger({
  title,
  incomes,
  expenses,
  symbol,
  showDates = false,
  hideTitle = false,
  onEditIncome,
  onEditExpense,
  onDeleteIncome,
  onDeleteExpense,
}: {
  title: string
  incomes: Income[]
  expenses: Expense[]
  symbol: string
  showDates?: boolean
  hideTitle?: boolean
  onEditIncome?: (item: Income) => void
  onEditExpense?: (item: Expense) => void
  onDeleteIncome?: (id: number) => void
  onDeleteExpense?: (id: number) => void
}) {
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
  const balance = totalIncome - totalExpense
  const isEmpty = incomes.length === 0 && expenses.length === 0

  return (
    <div className="flex flex-col md:flex-1 md:min-h-0 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-card)] md:overflow-hidden shadow-sm">
      {!hideTitle && (
        <div className="px-4 py-2.5 bg-[var(--color-primary)]/10 border-b border-[var(--color-border)]/30 shrink-0">
          <p className="text-sm font-semibold text-[var(--color-primary)]">{title}</p>
        </div>
      )}

      {isEmpty ? (
        <p className="text-xs text-[var(--color-text-muted)] py-8 text-center">No transactions in this period</p>
      ) : (
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 md:flex-1 md:min-h-0 md:overflow-hidden',
            'divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]/30',
            hideTitle && 'pt-0'
          )}
        >
          <div className="flex flex-col min-w-0 md:min-h-0 md:overflow-hidden">
            <div className="shrink-0 px-3 py-2 bg-emerald-500/10 border-b border-[var(--color-border)]/30 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Income
            </div>
            <div className="md:flex-1 md:min-h-0 md:overflow-y-auto md:overscroll-contain px-1 py-1">
              {incomes.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] py-6 text-center">No income</p>
              ) : (
                incomes.map((item) => (
                  <IncomeLedgerRow
                    key={item.id}
                    item={item}
                    symbol={symbol}
                    showDate={showDates}
                    onEdit={onEditIncome ? () => onEditIncome(item) : undefined}
                    onDelete={onDeleteIncome ? () => onDeleteIncome(item.id) : undefined}
                  />
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col min-w-0 md:min-h-0 md:overflow-hidden">
            <div className="shrink-0 px-3 py-2 bg-red-500/10 border-b border-[var(--color-border)]/30 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
              Expenses
            </div>
            <div className="md:flex-1 md:min-h-0 md:overflow-y-auto md:overscroll-contain px-1 py-1">
              {expenses.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] py-6 text-center">No expenses</p>
              ) : (
                expenses.map((item) => (
                  <ExpenseLedgerRow
                    key={item.id}
                    item={item}
                    symbol={symbol}
                    showDate={showDates}
                    onEdit={onEditExpense ? () => onEditExpense(item) : undefined}
                    onDelete={onDeleteExpense ? () => onDeleteExpense(item.id) : undefined}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="shrink-0 px-4 py-3 bg-[var(--color-background)]/50 border-t border-[var(--color-border)]/30 grid grid-cols-3 gap-2 text-xs sm:text-sm">
        <div>
          <p className="hidden md:block text-[var(--color-text-muted)] mb-0.5">Income</p>
          <p className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {symbol}{formatAmount(totalIncome)}
          </p>
        </div>
        <div className="text-center">
          <p className="hidden md:block text-[var(--color-text-muted)] mb-0.5">Expense</p>
          <p className="font-bold text-red-600 dark:text-red-400 tabular-nums">
            {symbol}{formatAmount(totalExpense)}
          </p>
        </div>
        <div className="text-right">
          <p className="hidden md:block text-[var(--color-text-muted)] mb-0.5">Balance</p>
          <p className={cn('font-bold tabular-nums', balance >= 0 ? 'text-[var(--color-text)]' : 'text-red-500')}>
            {symbol}{formatAmount(balance)}
          </p>
        </div>
      </div>
    </div>
  )
}

function PeriodToggle({
  period,
  onChange,
}: {
  period: Period
  onChange: (period: Period) => void
}) {
  const periods: { id: Period; label: string }[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
  ]

  return (
    <div className="inline-flex shrink-0 rounded-full border border-[var(--color-border)]/60 bg-[var(--color-surface-2)] p-1">
      {periods.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
            period === p.id
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

function ViewModeToggle({
  viewMode,
  onViewModeChange,
  compact,
}: {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  compact?: boolean
}) {
  return (
    <div className="flex rounded-lg border border-[var(--color-border)]/50 overflow-hidden shrink-0">
      <button
        onClick={() => onViewModeChange('ledger')}
        className={cn(
          'font-medium flex items-center justify-center transition-colors',
          compact ? 'px-2.5 py-2' : 'px-3 py-2 text-xs gap-1.5',
          viewMode === 'ledger'
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
        )}
        aria-label="Ledger view"
      >
        <List className={compact ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
        {!compact && <span className="hidden sm:inline">Ledger</span>}
      </button>
      <button
        onClick={() => onViewModeChange('cards')}
        className={cn(
          'font-medium flex items-center justify-center transition-colors',
          compact ? 'px-2.5 py-2' : 'px-3 py-2 text-xs gap-1.5',
          viewMode === 'cards'
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
        )}
        aria-label="Cards view"
      >
        <LayoutGrid className={compact ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
        {!compact && <span className="hidden sm:inline">Cards</span>}
      </button>
    </div>
  )
}

export function LedgerView({
  onEditIncome,
  onEditExpense,
  onDeleteIncome,
  onDeleteExpense,
  onAddTransaction,
  viewMode,
  onViewModeChange,
  hideViewToggleOnDesktop = false,
  className,
}: LedgerViewProps) {
  const [period, setPeriod] = useState<Period>('monthly')
  const [cursor, setCursor] = useState(new Date())
  const [drillMonth, setDrillMonth] = useState<string | null>(null)
  const isMdUp = useIsMdUp()

  const incomes = useFinanceStore((s) => s.incomes)
  const expenses = useFinanceStore((s) => s.expenses)
  const symbol = useSettingsStore((s) => s.currencySymbol)

  const { from, to, label } = getPeriodRange(period, cursor)

  const periodIncomes = useMemo(
    () => incomes.filter((i) => inPeriod(i.date, from, to)).sort((a, b) => a.date.localeCompare(b.date)),
    [incomes, from, to]
  )
  const periodExpenses = useMemo(
    () => expenses.filter((e) => inPeriod(e.date, from, to)).sort((a, b) => a.date.localeCompare(b.date)),
    [expenses, from, to]
  )

  const navigate = (dir: -1 | 1) => {
    setDrillMonth(null)
    if (period === 'daily') setCursor((d) => (dir === 1 ? addDays(d, 1) : subDays(d, 1)))
    else if (period === 'monthly') setCursor((d) => (dir === 1 ? addMonths(d, 1) : subMonths(d, 1)))
    else setCursor((d) => (dir === 1 ? addYears(d, 1) : subYears(d, 1)))
  }

  const handlePeriodChange = (p: Period) => {
    setPeriod(p)
    setCursor(new Date())
    setDrillMonth(null)
  }

  const drillIncomes = drillMonth
    ? incomes.filter((i) => i.date.startsWith(drillMonth)).sort((a, b) => a.date.localeCompare(b.date))
    : []
  const drillExpenses = drillMonth
    ? expenses.filter((e) => e.date.startsWith(drillMonth)).sort((a, b) => a.date.localeCompare(b.date))
    : []

  const showViewToggle = viewMode !== undefined && onViewModeChange !== undefined
  const showToolbarViewToggle = showViewToggle && !(hideViewToggleOnDesktop && isMdUp)

  const monthsWithData = useMemo(() => {
    if (period !== 'yearly') return []
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(cursor.getFullYear(), i, 1)
      const monthKey = format(monthDate, 'yyyy-MM')
      const mIncomes = periodIncomes.filter((inc) => inc.date.startsWith(monthKey))
      const mExpenses = periodExpenses.filter((exp) => exp.date.startsWith(monthKey))
      if (mIncomes.length === 0 && mExpenses.length === 0) return null
      return { monthDate, monthKey, mIncomes, mExpenses }
    }).filter((m): m is NonNullable<typeof m> => m !== null)
  }, [period, cursor, periodIncomes, periodExpenses])

  const isPeriodEmpty = periodIncomes.length === 0 && periodExpenses.length === 0
  const showDesktopEmpty = isMdUp && isPeriodEmpty && (period !== 'yearly' || !drillMonth)
  const useLedgerScroll =
    !showDesktopEmpty &&
    (period === 'daily' || period === 'monthly' || (period === 'yearly' && !!drillMonth))

  return (
    <div
      className={cn(
        'flex flex-col flex-1 min-h-0 gap-2',
        useLedgerScroll && 'md:overflow-hidden',
        className
      )}
    >
      {/* Unified toolbar: period toggle + navigator + view mode */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-card)] px-3 py-2.5 shadow-sm shrink-0">
        <PeriodToggle period={period} onChange={handlePeriodChange} />

        <div className="flex items-center gap-1 flex-1 min-w-0 sm:justify-end">
          <div className="flex items-center gap-1 flex-1 min-w-0 sm:flex-none sm:min-w-[200px] md:min-w-[240px]">
            {drillMonth && period === 'yearly' ? (
              <button
                onClick={() => setDrillMonth(null)}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] shrink-0"
                aria-label="Back to year view"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] shrink-0"
                aria-label="Previous period"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <span className="flex-1 text-sm font-semibold text-center truncate min-w-0 px-1">
              {drillMonth && period === 'yearly'
                ? format(parseISO(`${drillMonth}-01`), 'MMMM yyyy')
                : label}
            </span>

            {!drillMonth && (
              <button
                onClick={() => navigate(1)}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] shrink-0"
                aria-label="Next period"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {drillMonth && <div className="w-9 shrink-0" />}
          </div>

          {showToolbarViewToggle && viewMode && onViewModeChange && (
            <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} compact />
          )}
        </div>
      </div>

      {/* Ledger blocks */}
      <div
        className={cn(
          'flex flex-col flex-1 min-h-0 gap-2',
          useLedgerScroll ? 'md:overflow-hidden' : 'overflow-y-auto'
        )}
      >
        {showDesktopEmpty ? (
          <EmptyLedgerState onAddTransaction={onAddTransaction} />
        ) : period === 'daily' ? (
          <PeriodLedger
            title={label}
            hideTitle
            incomes={periodIncomes}
            expenses={periodExpenses}
            symbol={symbol}
            onEditIncome={onEditIncome}
            onEditExpense={onEditExpense}
            onDeleteIncome={onDeleteIncome}
            onDeleteExpense={onDeleteExpense}
          />
        ) : period === 'monthly' ? (
          <PeriodLedger
            title={label}
            hideTitle
            incomes={periodIncomes}
            expenses={periodExpenses}
            symbol={symbol}
            showDates
            onEditIncome={onEditIncome}
            onEditExpense={onEditExpense}
            onDeleteIncome={onDeleteIncome}
            onDeleteExpense={onDeleteExpense}
          />
        ) : drillMonth ? (
          isMdUp && drillIncomes.length === 0 && drillExpenses.length === 0 ? (
            <EmptyLedgerState onAddTransaction={onAddTransaction} />
          ) : (
            <PeriodLedger
              title={format(parseISO(`${drillMonth}-01`), 'MMMM yyyy')}
              hideTitle
              incomes={drillIncomes}
              expenses={drillExpenses}
              symbol={symbol}
              showDates
              onEditIncome={onEditIncome}
              onEditExpense={onEditExpense}
              onDeleteIncome={onDeleteIncome}
              onDeleteExpense={onDeleteExpense}
            />
          )
        ) : monthsWithData.length === 0 ? (
          isMdUp ? (
            <EmptyLedgerState onAddTransaction={onAddTransaction} />
          ) : (
            <p className="text-center text-sm text-[var(--color-text-muted)] py-12">No transactions this year</p>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {monthsWithData.map(({ monthDate, monthKey, mIncomes, mExpenses }) => {
              const mIncome = mIncomes.reduce((s, inc) => s + inc.amount, 0)
              const mExpense = mExpenses.reduce((s, exp) => s + exp.amount, 0)
              const mBalance = mIncome - mExpense
              const txCount = mIncomes.length + mExpenses.length

              return (
                <button
                  key={monthKey}
                  type="button"
                  onClick={() => setDrillMonth(monthKey)}
                  className={cn(
                    'rounded-xl border text-left overflow-hidden shadow-sm transition-all',
                    'border-[var(--color-border)]/50 bg-[var(--color-card)]',
                    'hover:border-[var(--color-primary)]/40 hover:shadow-md active:scale-[0.99]'
                  )}
                >
                  <div className="px-4 py-2.5 bg-[var(--color-primary)]/10 border-b border-[var(--color-border)]/30 flex items-center justify-between">
                    <p className="text-sm font-semibold">{format(monthDate, 'MMMM')}</p>
                    <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
                  </div>
                  <div className="p-3 text-sm space-y-2">
                    <p className="text-xs text-[var(--color-text-muted)]">{txCount} transaction{txCount !== 1 ? 's' : ''}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                        +{symbol}{formatAmount(mIncome)}
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-medium tabular-nums">
                        −{symbol}{formatAmount(mExpense)}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-[var(--color-border)]/30 text-right text-xs">
                    <span className="text-[var(--color-text-muted)]">Balance </span>
                    <span className={cn('font-bold tabular-nums', mBalance >= 0 ? 'text-[var(--color-text)]' : 'text-red-500')}>
                      {symbol}{formatAmount(mBalance)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export { ViewModeToggle }
