import { motion } from 'framer-motion'
import { ArrowRight, TrendingDown } from 'lucide-react'
import { Card } from '../ui/Card'
import { useFinance } from '../../hooks/useFinance'
import { useFinanceStore } from '../../stores/useFinanceStore'
import { formatCurrency, formatShortDate } from '../../utils/format'
import { CATEGORY_COLORS } from '../../constants/categories'
import { cn } from '../../utils/cn'

export function BalanceEngine() {
  const { stats, currencySymbol } = useFinance()
  const incomes = useFinanceStore((s) => s.incomes)
  const expenses = useFinanceStore((s) => s.expenses)

  const recentTransactions = [
    ...incomes.map((i) => ({ ...i, type: 'income' as const, label: i.source })),
    ...expenses.map((e) => ({ ...e, type: 'expense' as const, label: e.name })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)

  let runningBalance = stats.totalIncome

  const timeline = recentTransactions.map((tx) => {
    if (tx.type === 'income') {
      runningBalance = runningBalance
    } else {
      runningBalance -= tx.amount
    }
    return { ...tx, balance: runningBalance }
  })

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Balance Flow</h3>
        <div className="text-right">
          <p className="text-xs text-[var(--color-text-muted)]">Current Balance</p>
          <p className={cn('text-lg font-bold', stats.remainingBalance >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {formatCurrency(stats.remainingBalance, currencySymbol)}
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {stats.totalIncome > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
              ₹
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Starting Income</p>
              <p className="text-xs text-[var(--color-text-muted)]">This month</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-400">+{formatCurrency(stats.totalIncome, currencySymbol)}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Balance: {formatCurrency(stats.totalIncome, currencySymbol)}</p>
            </div>
          </motion.div>
        )}

        {timeline.filter((t) => t.type === 'expense').map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]"
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: `${CATEGORY_COLORS[tx.category] || '#94a3b8'}20`, color: CATEGORY_COLORS[tx.category] }}
            >
              <TrendingDown className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.label}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{tx.category} · {formatShortDate(tx.date)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-red-400">-{formatCurrency(tx.amount, currencySymbol)}</p>
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 justify-end">
                <ArrowRight className="h-2.5 w-2.5" />
                {formatCurrency(stats.totalIncome - timeline.slice(0, i + 1).filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), currencySymbol)}
              </p>
            </div>
          </motion.div>
        ))}

        {timeline.length === 0 && (
          <p className="text-center text-sm text-[var(--color-text-muted)] py-8">
            Add income and expenses to see balance flow
          </p>
        )}
      </div>
    </Card>
  )
}
