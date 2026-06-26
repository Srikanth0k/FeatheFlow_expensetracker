import { Card } from '../ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '../../utils/format'
import { useFinance } from '../../hooks/useFinance'

interface Props {
  currencySymbol: string
}

export function MonthComparisonChart({ currencySymbol }: Props) {
  const { stats } = useFinance()

  const data = [
    { name: 'Previous', income: stats.totalIncome, expense: stats.previousMonthSpend },
    { name: 'Current', income: stats.totalIncome, expense: stats.currentMonthSpend },
  ]

  return (
    <Card>
      <h3 className="font-semibold mb-4">Month Comparison</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              fontSize: '12px',
            }}
            formatter={(value) => formatCurrency(Number(value), currencySymbol)}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
          <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
