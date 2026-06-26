import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { useFinanceStore } from '../../stores/useFinanceStore'
import { getCategoryIcon } from '../../constants/categories'
import { motion, AnimatePresence } from 'framer-motion'

export function SearchFilterBar() {
  const filters = useFinanceStore((s) => s.filters)
  const setFilters = useFinanceStore((s) => s.setFilters)
  const resetFilters = useFinanceStore((s) => s.resetFilters)
  const incomes = useFinanceStore((s) => s.incomes)
  const expenses = useFinanceStore((s) => s.expenses)
  const [showFilters, setShowFilters] = useState(false)

  const usedCategories = useMemo(() => {
    const cats = new Set<string>()
    incomes.forEach((i) => cats.add(i.category))
    expenses.forEach((e) => cats.add(e.category))
    return Array.from(cats).sort()
  }, [incomes, expenses])

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search name, category, notes..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button
          variant={showFilters ? 'primary' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]/50">
              <Select
                label="Type"
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expense' },
                ]}
                value={filters.type}
                onChange={(e) => setFilters({ type: e.target.value as 'all' | 'income' | 'expense' })}
              />
              <Input
                label="From"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ dateFrom: e.target.value })}
              />
              <Input
                label="To"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ dateTo: e.target.value })}
              />
              <Select
                label="Sort By"
                options={[
                  { value: 'date', label: 'Date' },
                  { value: 'amount', label: 'Amount' },
                  { value: 'category', label: 'Category' },
                ]}
                value={filters.sortBy}
                onChange={(e) => setFilters({ sortBy: e.target.value as 'date' | 'amount' | 'category' })}
              />
              <Select
                label="Order"
                options={[
                  { value: 'desc', label: 'Descending' },
                  { value: 'asc', label: 'Ascending' },
                ]}
                value={filters.sortOrder}
                onChange={(e) => setFilters({ sortOrder: e.target.value as 'asc' | 'desc' })}
              />
              <Input
                label="Min Amount"
                type="number"
                value={filters.amountMin ?? ''}
                onChange={(e) => setFilters({ amountMin: e.target.value ? Number(e.target.value) : null })}
              />
              <Input
                label="Max Amount"
                type="number"
                value={filters.amountMax ?? ''}
                onChange={(e) => setFilters({ amountMax: e.target.value ? Number(e.target.value) : null })}
              />
              <div className="col-span-2 flex items-end gap-2">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-3 w-3" /> Reset
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'income', 'expense'].map((type) => (
          <button
            key={type}
            onClick={() => setFilters({ type: type as 'all' | 'income' | 'expense' })}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filters.type === type
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-active)]'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
        {usedCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              const cats = filters.categories.includes(cat)
                ? filters.categories.filter((c) => c !== cat)
                : [...filters.categories, cat]
              setFilters({ categories: cats })
            }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
              filters.categories.includes(cat)
                ? 'bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)]'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-active)]'
            }`}
          >
            <span aria-hidden>{getCategoryIcon(cat)}</span>
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
