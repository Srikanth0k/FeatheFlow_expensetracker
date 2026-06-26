import { useEffect, useMemo } from 'react'
import { Download, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import type { ExportBuildResult } from '../../services/exportService'

interface ExportPreviewModalProps {
  open: boolean
  onClose: () => void
  result: ExportBuildResult | null
  formatLabel: string
  onDownload: () => void
}

export function ExportPreviewModal({
  open,
  onClose,
  result,
  formatLabel,
  onDownload,
}: ExportPreviewModalProps) {
  const previewUrl = useMemo(() => {
    if (!result || result.previewType !== 'pdf') return null
    return URL.createObjectURL(result.blob)
  }, [result])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <AnimatePresence>
      {open && result && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative flex h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl border border-[var(--color-border)]/50 bg-[var(--color-card)] shadow-2xl sm:h-[88dvh] sm:rounded-2xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)]/50 px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-lg font-semibold">{formatLabel} Preview</h2>
                <p className="text-xs text-[var(--color-text-muted)]">{result.filename}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={onDownload}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden bg-[var(--color-surface-2)]">
              {result.previewType === 'pdf' && previewUrl && (
                <iframe
                  title={`${formatLabel} preview`}
                  src={previewUrl}
                  className="h-full w-full border-0 bg-white"
                />
              )}

              {result.previewType === 'html' && result.previewHtml && (
                <div
                  className="export-preview-html h-full overflow-auto p-4 sm:p-6 [&_.export-sheet]:mb-8 [&_.export-sheet_h3]:mb-3 [&_.export-sheet_h3]:text-sm [&_.export-sheet_h3]:font-semibold [&_.export-sheet_h3]:uppercase [&_.export-sheet_h3]:tracking-wide [&_.export-sheet_h3]:text-[var(--color-text-muted)] [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-[var(--color-border)] [&_td]:border [&_td]:border-[var(--color-border)] [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_th]:border [&_th]:border-[var(--color-border)] [&_th]:bg-[var(--color-surface-1)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: result.previewHtml }}
                />
              )}

              {result.previewType === 'text' && result.previewText && (
                <pre className="h-full overflow-auto p-4 sm:p-6 text-xs sm:text-sm leading-relaxed text-[var(--color-text)] whitespace-pre-wrap font-mono">
                  {result.previewText}
                </pre>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
