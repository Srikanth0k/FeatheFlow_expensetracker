import { Card } from '../ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/format'
import type { MonthlyData } from '../../types'

interface Props {
  data: MonthlyData[]
  currencySymbol: string
}

export function MonthlyBarChart({ data, currencySymbol }: Props) {
  return (
    <Card>
      <h3 className="font-semibold mb-4">Monthly Spending</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
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
          <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
