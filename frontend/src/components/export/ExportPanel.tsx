import { useState } from 'react'
import { Download, Calendar, Eye } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useFinance } from '../../hooks/useFinance'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { buildExport, downloadExportResult } from '../../services/exportService'
import { ExportPreviewModal } from './ExportPreviewModal'
import { getCurrentMonthRange } from '../../utils/format'
import type { ExportOptions } from '../../types'
import type { ExportBuildResult } from '../../services/exportService'

const formatOptions: { value: ExportOptions['format']; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'txt', label: 'TXT' },
]

const presets = [
  { label: 'Current Month', getRange: getCurrentMonthRange },
  { label: 'Income Only', type: 'income' as const },
  { label: 'Expenses Only', type: 'expense' as const },
  { label: 'Complete History', getRange: () => ({ from: '2020-01-01', to: new Date().toISOString().split('T')[0] }) },
]

export function ExportPanel() {
  const { incomes, expenses, stats } = useFinance()
  const currencySymbol = useSettingsStore((s) => s.currencySymbol)
  const userName = useSettingsStore((s) => s.userName)
  const monthRange = getCurrentMonthRange()

  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateFrom: monthRange.from,
    dateTo: monthRange.to,
    categories: [],
    type: 'all',
    includeCharts: true,
    includeInsights: true,
  })

  const [exporting, setExporting] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewResult, setPreviewResult] = useState<ExportBuildResult | null>(null)
  const [previewFormatLabel, setPreviewFormatLabel] = useState('Report')

  const createExport = (format: ExportOptions['format']) => {
    return buildExport(
      format,
      incomes,
      expenses,
      { ...options, format },
      stats,
      currencySymbol,
      userName
    )
  }

  const handlePreview = () => {
    const fmt = formatOptions.find((f) => f.value === options.format)
    setPreviewFormatLabel(fmt?.label || 'Report')
    setPreviewResult(createExport(options.format))
    setPreviewOpen(true)
  }

  const handleDownload = () => {
    setExporting(true)
    try {
      downloadExportResult(createExport(options.format))
    } finally {
      setTimeout(() => setExporting(false), 500)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Export & Reports</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Preview your report, then download when ready
        </p>
      </div>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Export Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="From Date"
            type="date"
            value={options.dateFrom}
            onChange={(e) => setOptions({ ...options, dateFrom: e.target.value })}
          />
          <Input
            label="To Date"
            type="date"
            value={options.dateTo}
            onChange={(e) => setOptions({ ...options, dateTo: e.target.value })}
          />
          <Select
            label="Data Type"
            options={[
              { value: 'all', label: 'All Transactions' },
              { value: 'income', label: 'Income Only' },
              { value: 'expense', label: 'Expenses Only' },
            ]}
            value={options.type}
            onChange={(e) => setOptions({ ...options, type: e.target.value as 'all' | 'income' | 'expense' })}
          />
          <Select
            label="Format"
            options={formatOptions}
            value={options.format}
            onChange={(e) => setOptions({ ...options, format: e.target.value as ExportOptions['format'] })}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => {
                const updates: Partial<ExportOptions> = {}
                if (preset.getRange) {
                  const range = preset.getRange()
                  updates.dateFrom = range.from
                  updates.dateTo = range.to
                }
                if (preset.type) updates.type = preset.type
                setOptions({ ...options, ...updates })
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="outline" size="lg" onClick={handlePreview}>
            <Eye className="h-4 w-4" /> Preview Report
          </Button>
          <Button className="w-full" size="lg" onClick={handleDownload} loading={exporting}>
            <Download className="h-4 w-4" /> Download Report
          </Button>
        </div>
      </Card>

      <ExportPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        result={previewResult}
        formatLabel={previewFormatLabel}
        onDownload={() => {
          if (previewResult) downloadExportResult(previewResult)
        }}
      />
    </div>
  )
}
