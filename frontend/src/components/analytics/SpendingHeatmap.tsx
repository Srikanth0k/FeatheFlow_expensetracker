import { Card } from '../ui/Card'
import { cn } from '../../utils/cn'
import type { DailySpending } from '../../types'

interface Props {
  data: DailySpending[]
  currencySymbol: string
}

export function SpendingHeatmap({ data, currencySymbol }: Props) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1)

  const getIntensity = (amount: number) => {
    if (amount === 0) return 'bg-[var(--color-surface-subtle)]'
    const ratio = amount / maxAmount
    if (ratio > 0.75) return 'bg-red-500/60'
    if (ratio > 0.5) return 'bg-orange-500/50'
    if (ratio > 0.25) return 'bg-amber-500/40'
    return 'bg-emerald-500/30'
  }

  return (
    <Card>
      <h3 className="font-semibold mb-4">Daily Spending Heatmap</h3>
      <div className="grid grid-cols-7 gap-1.5">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-[var(--color-text-muted)] font-medium py-1">
            {d}
          </div>
        ))}
        {data.map((day) => (
          <div
            key={day.date}
            className={cn(
              'aspect-square rounded-lg flex flex-col items-center justify-center transition-colors cursor-default',
              getIntensity(day.amount)
            )}
            title={`${day.date}: ${currencySymbol}${day.amount}`}
          >
            <span className="text-[10px] font-medium">{day.day}</span>
            {day.amount > 0 && (
              <span className="text-[8px] opacity-70 hidden sm:block">
                {day.amount >= 1000 ? `${(day.amount / 1000).toFixed(1)}k` : day.amount}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-[var(--color-text-muted)]">
        <span>Less</span>
        <div className="flex gap-0.5">
          {['bg-[var(--color-surface-subtle)]', 'bg-emerald-500/30', 'bg-amber-500/40', 'bg-orange-500/50', 'bg-red-500/60'].map((c, i) => (
            <div key={i} className={cn('w-3 h-3 rounded', c)} />
          ))}
        </div>
        <span>More</span>
      </div>
    </Card>
  )
}
