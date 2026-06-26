import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { FullPagePanel } from '../ui/FullPagePanel'
import { IncomeForm } from './IncomeForm'
import { ExpenseForm } from './ExpenseForm'
import { cn } from '../../utils/cn'
import type { Income, Expense } from '../../types'

export type TransactionTab = 'expense' | 'income'

interface AddTransactionModalProps {
  open: boolean
  onClose: () => void
  usePanel?: boolean
  editIncome?: Income | null
  editExpense?: Expense | null
  initialTab?: TransactionTab
}

function TransactionTypeTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TransactionTab
  onTabChange: (tab: TransactionTab) => void
}) {
  return (
    <div className="flex shrink-0 border-b border-[var(--color-border)]/50">
      <button
        type="button"
        onClick={() => onTabChange('expense')}
        className={cn(
          'flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors',
          activeTab === 'expense'
            ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
        )}
      >
        <TrendingDown className="h-4 w-4" />
        Expense
      </button>
      <button
        type="button"
        onClick={() => onTabChange('income')}
        className={cn(
          'flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors',
          activeTab === 'income'
            ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
        )}
      >
        <TrendingUp className="h-4 w-4" />
        Income
      </button>
    </div>
  )
}

export function AddTransactionModal({
  open,
  onClose,
  usePanel = false,
  editIncome = null,
  editExpense = null,
  initialTab = 'expense',
}: AddTransactionModalProps) {
  const [activeTab, setActiveTab] = useState<TransactionTab>(initialTab)
  const isEdit = Boolean(editIncome || editExpense)

  useEffect(() => {
    if (open) {
      if (editIncome) setActiveTab('income')
      else if (editExpense) setActiveTab('expense')
      else setActiveTab(initialTab)
    }
  }, [open, editIncome, editExpense, initialTab])

  const title = editIncome
    ? 'Edit Income'
    : editExpense
      ? 'Edit Expense'
      : 'Add Transaction'

  const content = (
    <div className="flex flex-col">
      {!isEdit && <TransactionTypeTabs activeTab={activeTab} onTabChange={setActiveTab} />}
      {activeTab === 'expense' || editExpense ? (
        <ExpenseForm editData={editExpense} onSuccess={onClose} />
      ) : (
        <IncomeForm editData={editIncome} onSuccess={onClose} />
      )}
    </div>
  )

  if (usePanel) {
    return (
      <FullPagePanel open={open} onClose={onClose} title={title}>
        {content}
      </FullPagePanel>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      {content}
    </Modal>
  )
}
