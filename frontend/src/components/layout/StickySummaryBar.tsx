import { motion } from 'framer-motion'
import { useFinance } from '../../hooks/useFinance'
import { formatCurrency } from '../../utils/format'
import { cn } from '../../utils/cn'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface StickySummaryBarProps {
  /** When true, renders inside mobile top chrome (no outer sticky shell) */
  embedded?: boolean
}

export function StickySummaryBar({ embedded = false }: StickySummaryBarProps) {
  const { stats, currencySymbol } = useFinance()

  const items = [
    { label: 'Income', value: stats.totalIncome, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Expense', value: stats.totalExpense, icon: TrendingDown, color: 'text-red-400' },
    { label: 'Balance', value: stats.remainingBalance, icon: Wallet, color: stats.remainingBalance >= 0 ? 'text-emerald-400' : 'text-red-400' },
  ]

  const content = (
    <div className={cn('w-full', embedded ? 'px-4 pb-2.5' : 'px-4 md:px-6 py-2.5 md:py-3')}>
      <div className="flex w-full rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface-1)] shadow-sm divide-x divide-[var(--color-border)]/50 overflow-hidden">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="flex flex-1 items-center justify-center gap-2 md:gap-2.5 min-w-0 px-3 py-2.5 md:px-4 md:py-3"
            >
              <div className={cn('hidden md:flex rounded-lg bg-[var(--color-surface-2)] p-1.5 shrink-0', item.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-center">
                <p className="hidden md:block text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                  {item.label}
                </p>
                <p className={cn('text-xs md:text-sm font-bold tabular-nums truncate', item.color)}>
                  {formatCurrency(item.value, currencySymbol)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  if (embedded) return content

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 border-b border-[var(--color-border)]/30 bg-[var(--color-background)]/95 backdrop-blur-sm"
    >
      {content}
    </motion.div>
  )
}
