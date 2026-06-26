import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { ReactNode } from 'react'

interface FullPagePanelProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function FullPagePanel({ open, onClose, title, children }: FullPagePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              'relative flex w-[70vw] max-w-3xl flex-col overflow-hidden',
              'h-fit max-h-[92dvh]',
              'rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-card)] shadow-2xl'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)]/50 px-5 py-4 sm:px-6">
              {title && <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>}
              <button
                onClick={onClose}
                className="ml-auto rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex max-h-[calc(92dvh-4.5rem)] flex-col overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
