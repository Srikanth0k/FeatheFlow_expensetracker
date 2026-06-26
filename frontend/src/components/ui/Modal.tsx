import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full bg-[var(--color-card)] rounded-t-2xl sm:rounded-2xl shadow-2xl',
              'max-h-[90dvh] flex flex-col border border-[var(--color-border)]/50',
              sizes[size]
            )}
          >
            {title && (
              <div className="shrink-0 flex items-center justify-between border-b border-[var(--color-border)]/50 bg-[var(--color-card)] px-5 py-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-muted)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
