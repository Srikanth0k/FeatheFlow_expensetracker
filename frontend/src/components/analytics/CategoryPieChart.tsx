import { Card } from '../ui/Card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CATEGORY_COLORS } from '../../constants/categories'
import { formatCurrency } from '../../utils/format'
import type { CategoryBreakdown } from '../../types'

interface Props {
  data: CategoryBreakdown[]
  currencySymbol: string
}

export function CategoryPieChart({ data, currencySymbol }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <h3 className="font-semibold mb-4">Category Distribution</h3>
        <p className="text-center text-sm text-[var(--color-text-muted)] py-12">No expense data yet</p>
      </Card>
    )
  }

  const chartData = data.slice(0, 8).map((d) => ({
    name: d.category,
    value: d.amount,
    color: CATEGORY_COLORS[d.category] || '#94a3b8',
  }))

  return (
    <Card>
      <h3 className="font-semibold mb-4">Category Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              fontSize: '12px',
            }}
            formatter={(value) => formatCurrency(Number(value), currencySymbol)}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px' }}
            formatter={(value) => <span style={{ color: 'var(--color-text-muted)' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
