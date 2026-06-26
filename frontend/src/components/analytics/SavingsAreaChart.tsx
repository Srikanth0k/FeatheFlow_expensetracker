import { Card } from '../ui/Card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/format'
import type { MonthlyData } from '../../types'

interface Props {
  data: MonthlyData[]
  currencySymbol: string
}

export function SavingsAreaChart({ data, currencySymbol }: Props) {
  return (
    <Card>
      <h3 className="font-semibold mb-4">Savings Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area type="monotone" dataKey="savings" stroke="#10b981" fill="url(#savingsGradient)" strokeWidth={2} name="Savings" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
