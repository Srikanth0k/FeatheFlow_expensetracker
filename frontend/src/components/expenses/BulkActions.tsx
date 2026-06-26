import { Trash2, Download } from 'lucide-react'
import { Button } from '../ui/Button'
import { useFinanceStore } from '../../stores/useFinanceStore'
import { motion, AnimatePresence } from 'framer-motion'

interface BulkActionsProps {
  onExport: () => void
}

export function BulkActions({ onExport }: BulkActionsProps) {
  const selectedIds = useFinanceStore((s) => s.selectedIds)
  const clearSelection = useFinanceStore((s) => s.clearSelection)
  const bulkDelete = useFinanceStore((s) => s.bulkDelete)

  if (selectedIds.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl border border-[var(--color-border)]/50"
      >
        <span className="text-sm font-medium">{selectedIds.length} selected</span>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button variant="danger" size="sm" onClick={bulkDelete}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
        <Button variant="ghost" size="sm" onClick={clearSelection}>
          Cancel
        </Button>
      </motion.div>
    </AnimatePresence>
  )
}
