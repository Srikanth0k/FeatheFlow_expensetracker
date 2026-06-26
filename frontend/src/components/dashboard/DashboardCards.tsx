import { motion } from 'framer-motion'
import { BarChart3, Target } from 'lucide-react'
import { Card } from '../ui/Card'
import { useFinance } from '../../hooks/useFinance'
import { formatCurrency } from '../../utils/format'
import { cn } from '../../utils/cn'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function DashboardCards() {
  const { stats, currencySymbol } = useFinance()

  const cards = [
    {
      title: 'Investment',
      value: formatCurrency(stats.investment, currencySymbol),
      icon: BarChart3,
      color: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
    },
    {
      title: 'Top Category',
      value: stats.highestSpendingCategory,
      subtitle: formatCurrency(stats.highestSpendingAmount, currencySymbol),
      icon: Target,
      color: 'from-cyan-500/20 to-cyan-600/5',
      iconColor: 'text-cyan-400',
    },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 md:gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <motion.div key={card.title} variants={item}>
            <Card hover className={cn('relative overflow-hidden bg-gradient-to-br h-full', card.color)}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1 truncate">{card.title}</p>
                  <p className="text-lg md:text-xl font-bold truncate">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{card.subtitle}</p>
                  )}
                </div>
                <div className={cn('rounded-lg p-2 bg-[var(--color-surface-subtle)] shrink-0', card.iconColor)}>
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
