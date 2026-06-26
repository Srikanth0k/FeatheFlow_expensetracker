import { DashboardCards } from '../components/dashboard/DashboardCards'
import { SpendingHeatmap } from '../components/analytics/SpendingHeatmap'
import { useFinance } from '../hooks/useFinance'
import { useFinanceStore } from '../stores/useFinanceStore'
import { Sparkles } from 'lucide-react'

export function DashboardPage() {
  const { dailySpending, currencySymbol } = useFinance()
  const incomes = useFinanceStore((s) => s.incomes)
  const expenses = useFinanceStore((s) => s.expenses)

  const isEmpty = incomes.length === 0 && expenses.length === 0

  return (
    <div className="space-y-6">
      {isEmpty && (
        <div className="text-center py-8 px-4 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 border border-[var(--color-primary)]/20">
          <Sparkles className="h-8 w-8 mx-auto text-[var(--color-primary)] mb-3" />
          <h2 className="text-lg font-bold mb-2">Welcome to Featherflow!</h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
            Start tracking your personal finances by adding your first income or expense.
          </p>
        </div>
      )}

      <DashboardCards />

      <SpendingHeatmap data={dailySpending} currencySymbol={currencySymbol} />
    </div>
  )
}
