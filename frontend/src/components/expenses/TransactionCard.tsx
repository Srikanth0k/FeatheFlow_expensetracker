import { motion } from 'framer-motion'
import { Edit2, Trash2, Copy, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../ui/Card'
import { Modal } from '../ui/Modal'
import { formatCurrency, formatShortDate } from '../../utils/format'
import { CATEGORY_COLORS } from '../../constants/categories'
import { cn } from '../../utils/cn'
import type { Income, Expense } from '../../types'

interface TransactionCardProps {
  item: (Income & { type: 'income' }) | (Expense & { type: 'expense' })
  currencySymbol: string
  selectionMode?: boolean
  selected?: boolean
  onSelect?: (id: number) => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
}

export function TransactionCard({
  item,
  currencySymbol,
  selectionMode = false,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
}: TransactionCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const isIncome = item.type === 'income'
  const name = isIncome ? item.source : item.name
  const color = CATEGORY_COLORS[item.category] || '#94a3b8'

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative"
      >
        <Card
          hover
          padding="sm"
          className={cn(
            'cursor-pointer transition-all',
            selectionMode && selected && 'ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]/50'
          )}
          onClick={() => {
            if (selectionMode && onSelect) {
              onSelect(item.id)
              return
            }
            setShowDetails(true)
          }}
        >
          <div className="flex items-center gap-3">
            {selectionMode && onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => { e.stopPropagation(); onSelect(item.id) }}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
              />
            )}
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}20` }}
            >
              {isIncome ? (
                <TrendingUp className="h-4 w-4" style={{ color }} />
              ) : (
                <TrendingDown className="h-4 w-4" style={{ color }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {item.category}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">{formatShortDate(item.date)}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={cn('font-bold text-sm', isIncome ? 'text-emerald-400' : 'text-red-400')}>
                {isIncome ? '+' : '-'}{formatCurrency(item.amount, currencySymbol)}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setShowActions(!showActions) }}
                className="mt-1 p-1 rounded-lg hover:bg-[var(--color-surface-subtle)]"
              >
                <MoreVertical className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              </button>
            </div>
          </div>

          {showActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]/30"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--color-surface-subtle)] text-xs hover:bg-[var(--color-surface-active)]">
                <Edit2 className="h-3 w-3" /> Edit
              </button>
              <button onClick={onDuplicate} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--color-surface-subtle)] text-xs hover:bg-[var(--color-surface-active)]">
                <Copy className="h-3 w-3" /> Copy
              </button>
              <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </motion.div>
          )}
        </Card>
      </motion.div>

      <Modal open={showDetails} onClose={() => setShowDetails(false)} title="Transaction Details" size="sm">
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className={cn('text-3xl font-bold', isIncome ? 'text-emerald-400' : 'text-red-400')}>
              {isIncome ? '+' : '-'}{formatCurrency(item.amount, currencySymbol)}
            </p>
            <p className="text-lg font-medium mt-1">{name}</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Type</span><span className="capitalize">{item.type}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Category</span><span>{item.category}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Date</span><span>{item.date}</span></div>
            {!isIncome && (
              <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Payment</span><span className="capitalize">{item.paymentMethod}</span></div>
            )}
            {item.notes && (
              <div><span className="text-[var(--color-text-muted)]">Notes</span><p className="mt-1 p-3 rounded-lg bg-[var(--color-surface-subtle)]">{item.notes}</p></div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowDetails(false); onEdit() }} className="flex-1 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] text-sm font-medium hover:bg-[var(--color-surface-active)]">Edit</button>
            <button onClick={() => { setShowDetails(false); onDelete() }} className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20">Delete</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
