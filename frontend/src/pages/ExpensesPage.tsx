import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { AddTransactionModal } from '../components/expenses/AddTransactionModal'
import { TransactionCard } from '../components/expenses/TransactionCard'
import { LedgerView, ViewModeToggle } from '../components/expenses/LedgerView'
import { SearchFilterBar } from '../components/expenses/SearchFilterBar'
import { BulkActions } from '../components/expenses/BulkActions'
import { useFinance } from '../hooks/useFinance'
import { useFinanceStore } from '../stores/useFinanceStore'
import { useIsMdUp } from '../hooks/useMediaQuery'
import { cn } from '../utils/cn'
import type { Income, Expense } from '../types'
import { AnimatePresence } from 'framer-motion'

type ViewMode = 'ledger' | 'cards'

export function ExpensesPage() {
  const { filteredTransactions, currencySymbol } = useFinance()
  const selectedIds = useFinanceStore((s) => s.selectedIds)
  const toggleSelect = useFinanceStore((s) => s.toggleSelect)
  const selectAll = useFinanceStore((s) => s.selectAll)
  const deleteIncome = useFinanceStore((s) => s.deleteIncome)
  const deleteExpense = useFinanceStore((s) => s.deleteExpense)
  const duplicateIncome = useFinanceStore((s) => s.duplicateIncome)
  const duplicateExpense = useFinanceStore((s) => s.duplicateExpense)

  const [viewMode, setViewMode] = useState<ViewMode>('ledger')
  const [showModal, setShowModal] = useState(false)
  const [editIncome, setEditIncome] = useState<Income | null>(null)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const isMdUp = useIsMdUp()

  const openAddTransaction = () => {
    setEditIncome(null)
    setEditExpense(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditIncome(null)
    setEditExpense(null)
  }

  const handleEditIncome = (item: Income) => {
    setEditIncome(item)
    setEditExpense(null)
    setShowModal(true)
  }

  const handleEditExpense = (item: Expense) => {
    setEditExpense(item)
    setEditIncome(null)
    setShowModal(true)
  }

  const handleEdit = (item: typeof filteredTransactions[0]) => {
    if (item.type === 'income') handleEditIncome(item)
    else handleEditExpense(item)
  }

  const handleDelete = (item: typeof filteredTransactions[0]) => {
    if (item.type === 'income') deleteIncome(item.id)
    else deleteExpense(item.id)
  }

  const handleDuplicate = (item: typeof filteredTransactions[0]) => {
    if (item.type === 'income') duplicateIncome(item.id)
    else duplicateExpense(item.id)
  }

  return (
    <div
      className={cn(
        'flex flex-col flex-1 min-h-0 lg:overflow-hidden',
        viewMode === 'ledger' ? 'gap-2' : 'gap-4 md:gap-6'
      )}
    >
      <div className="shrink-0 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Transactions</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {filteredTransactions.length} records
          </p>
        </div>
        <div className="flex items-center gap-2">
          {viewMode === 'cards' && (
            <>
              <div className="hidden md:flex">
                <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => {
                  setSelectionMode(!selectionMode)
                  if (selectionMode) useFinanceStore.getState().clearSelection()
                }}
              >
                {selectionMode ? 'Cancel' : 'Select'}
              </Button>
            </>
          )}
          {viewMode === 'ledger' && (
            <div className="hidden md:flex">
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          )}
          <Button size="md" onClick={openAddTransaction}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {viewMode === 'cards' && (
        <div className="flex md:hidden justify-end">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} compact />
        </div>
      )}

      {viewMode === 'cards' && <SearchFilterBar />}

      {viewMode === 'ledger' ? (
        <LedgerView
          className="flex-1 min-h-0"
          onEditIncome={handleEditIncome}
          onEditExpense={handleEditExpense}
          onDeleteIncome={deleteIncome}
          onDeleteExpense={deleteExpense}
          onAddTransaction={openAddTransaction}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hideViewToggleOnDesktop
        />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
          {selectionMode && (
            <Button variant="ghost" size="sm" onClick={() => selectAll(filteredTransactions.map((t) => t.id))}>
              Select All
            </Button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredTransactions.map((item) => (
                <TransactionCard
                  key={item.id}
                  item={item}
                  currencySymbol={currencySymbol}
                  selectionMode={selectionMode}
                  selected={selectedIds.includes(item.id)}
                  onSelect={selectionMode ? toggleSelect : undefined}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                  onDuplicate={() => handleDuplicate(item)}
                />
              ))}
            </AnimatePresence>
          </div>
          {filteredTransactions.length === 0 && (
            isMdUp ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-[var(--color-border)]/60 bg-[var(--color-surface-subtle)]/50">
                <p className="text-sm text-[var(--color-text-muted)] mb-6 text-center">
                  No transactions yet. Add your first transaction to get started.
                </p>
                <Button onClick={openAddTransaction}>
                  <Plus className="h-4 w-4" /> Add Transaction
                </Button>
              </div>
            ) : (
              <p className="text-center text-sm text-[var(--color-text-muted)] py-12 col-span-full">No transactions found</p>
            )
          )}
          <BulkActions onExport={() => {}} />
        </div>
      )}

      <AddTransactionModal
        open={showModal}
        onClose={closeModal}
        usePanel={isMdUp}
        editIncome={editIncome}
        editExpense={editExpense}
      />
    </div>
  )
}
