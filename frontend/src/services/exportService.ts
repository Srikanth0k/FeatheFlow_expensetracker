import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import type { Income, Expense, ExportOptions, DashboardStats } from '../types'
import { formatCurrency, formatDate, formatMonthYear } from '../utils/format'
import { getCategoryBreakdown } from '../utils/analytics'
import { isInDateRange } from '../utils/format'

export type ExportPreviewType = 'pdf' | 'html' | 'text'

export interface ExportBuildResult {
  blob: Blob
  filename: string
  previewType: ExportPreviewType
  previewHtml?: string
  previewText?: string
  sheetNames?: string[]
}

function filterData(
  incomes: Income[],
  expenses: Expense[],
  options: ExportOptions
) {
  const filteredIncomes = incomes.filter(
    (i) =>
      isInDateRange(i.date, options.dateFrom, options.dateTo) &&
      (options.categories.length === 0 || options.categories.includes(i.category)) &&
      (options.type === 'all' || options.type === 'income')
  )
  const filteredExpenses = expenses.filter(
    (e) =>
      isInDateRange(e.date, options.dateFrom, options.dateTo) &&
      (options.categories.length === 0 || options.categories.includes(e.category)) &&
      (options.type === 'all' || options.type === 'expense')
  )
  return { filteredIncomes, filteredExpenses }
}

function buildPdfDocument(
  incomes: Income[],
  expenses: Expense[],
  options: ExportOptions,
  stats: DashboardStats,
  symbol: string,
  userName: string
) {
  const { filteredIncomes, filteredExpenses } = filterData(incomes, expenses, options)
  const breakdown = getCategoryBreakdown(filteredExpenses)
  const doc = new jsPDF()

  doc.setFontSize(22)
  doc.setTextColor(16, 185, 129)
  doc.text('Featherflow', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Personal Expense Report — ${formatMonthYear()}`, 14, 28)
  doc.text(`User: ${userName}`, 14, 34)
  doc.text(`Period: ${options.dateFrom} to ${options.dateTo}`, 14, 40)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 46)

  const totalIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0)

  doc.setFontSize(14)
  doc.setTextColor(30)
  doc.text('Summary', 14, 58)

  autoTable(doc, {
    startY: 62,
    head: [['Metric', 'Amount']],
    body: [
      ['Total Income', formatCurrency(totalIncome, symbol)],
      ['Total Expenses', formatCurrency(totalExpense, symbol)],
      ['Remaining Balance', formatCurrency(totalIncome - totalExpense, symbol)],
      ['Savings Rate', `${stats.savingsRate}%`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
  })

  if (breakdown.length > 0) {
    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10,
      head: [['Category', 'Amount', '%']],
      body: breakdown.map((b) => [b.category, formatCurrency(b.amount, symbol), `${b.percentage}%`]),
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    })
  }

  autoTable(doc, {
    startY: (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10,
    head: [['Date', 'Name', 'Category', 'Amount']],
    body: filteredExpenses.map((e) => [
      formatDate(e.date),
      e.name,
      e.category,
      formatCurrency(e.amount, symbol),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] },
  })

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Featherflow Report — Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10)
  }

  return doc
}

function buildExcelWorkbook(
  incomes: Income[],
  expenses: Expense[],
  options: ExportOptions,
  stats: DashboardStats
) {
  const { filteredIncomes, filteredExpenses } = filterData(incomes, expenses, options)
  const breakdown = getCategoryBreakdown(filteredExpenses)
  const totalIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0)

  const wb = XLSX.utils.book_new()

  const summaryData = [
    ['Featherflow Monthly Report'],
    ['Period', `${options.dateFrom} to ${options.dateTo}`],
    [],
    ['Metric', 'Value'],
    ['Total Income', totalIncome],
    ['Total Expenses', totalExpense],
    ['Balance', totalIncome - totalExpense],
    ['Savings Rate', `${stats.savingsRate}%`],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary')

  const incomeSheet = [
    ['Source', 'Amount', 'Date', 'Category', 'Notes'],
    ...filteredIncomes.map((i) => [i.source, i.amount, i.date, i.category, i.notes || '']),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incomeSheet), 'Income')

  const expenseSheet = [
    ['Name', 'Amount', 'Date', 'Category', 'Payment', 'Notes'],
    ...filteredExpenses.map((e) => [e.name, e.amount, e.date, e.category, e.paymentMethod, e.notes || '']),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(expenseSheet), 'Expenses')

  const analyticsSheet = [
    ['Month', 'Income', 'Expense', 'Savings'],
    ['Current', totalIncome, totalExpense, totalIncome - totalExpense],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(analyticsSheet), 'Analytics')

  const categorySheet = [
    ['Category', 'Amount', 'Count', 'Percentage'],
    ...breakdown.map((b) => [b.category, b.amount, b.count, `${b.percentage}%`]),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(categorySheet), 'Categories')

  return wb
}

export function buildExport(
  format: ExportOptions['format'],
  incomes: Income[],
  expenses: Expense[],
  options: ExportOptions,
  stats: DashboardStats,
  symbol: string,
  userName: string
): ExportBuildResult {
  switch (format) {
    case 'pdf': {
      const doc = buildPdfDocument(incomes, expenses, options, stats, symbol, userName)
      const blob = doc.output('blob')
      return {
        blob,
        filename: `finflow-report-${options.dateFrom}.pdf`,
        previewType: 'pdf',
      }
    }
    case 'xlsx': {
      const wb = buildExcelWorkbook(incomes, expenses, options, stats)
      const array = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([array], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const sheetNames = wb.SheetNames
      const previewHtml = sheetNames
        .map((name) => {
          const sheet = wb.Sheets[name]
          if (!sheet) return ''
          return `<section class="export-sheet"><h3>${name}</h3>${XLSX.utils.sheet_to_html(sheet)}</section>`
        })
        .join('')
      return {
        blob,
        filename: `finflow-report-${options.dateFrom}.xlsx`,
        previewType: 'html',
        previewHtml,
        sheetNames,
      }
    }
    case 'csv': {
      const { filteredIncomes, filteredExpenses } = filterData(incomes, expenses, options)
      const lines: string[] = ['Type,Name/Source,Amount,Date,Category,Notes']
      filteredIncomes.forEach((i) => {
        lines.push(`Income,"${i.source}",${i.amount},${i.date},${i.category},"${i.notes || ''}"`)
      })
      filteredExpenses.forEach((e) => {
        lines.push(`Expense,"${e.name}",${e.amount},${e.date},${e.category},"${e.notes || ''}"`)
      })
      const previewText = lines.join('\n')
      const blob = new Blob([previewText], { type: 'text/csv;charset=utf-8' })
      return {
        blob,
        filename: `finflow-export-${options.dateFrom}.csv`,
        previewType: 'text',
        previewText,
      }
    }
    case 'json': {
      const { filteredIncomes, filteredExpenses } = filterData(incomes, expenses, options)
      const data = {
        exportedAt: new Date().toISOString(),
        dateRange: { from: options.dateFrom, to: options.dateTo },
        incomes: filteredIncomes,
        expenses: filteredExpenses,
      }
      const previewText = JSON.stringify(data, null, 2)
      const blob = new Blob([previewText], { type: 'application/json' })
      return {
        blob,
        filename: `finflow-backup-${options.dateFrom}.json`,
        previewType: 'text',
        previewText,
      }
    }
    case 'txt': {
      const { filteredIncomes, filteredExpenses } = filterData(incomes, expenses, options)
      const totalIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0)
      const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0)
      const lines = [
        `FINFLOW EXPENSE REPORT`,
        `Generated: ${new Date().toLocaleString()}`,
        `User: ${userName}`,
        `Period: ${options.dateFrom} to ${options.dateTo}`,
        ``,
        `SUMMARY`,
        `Total Income: ${formatCurrency(totalIncome, symbol)}`,
        `Total Expenses: ${formatCurrency(totalExpense, symbol)}`,
        `Balance: ${formatCurrency(totalIncome - totalExpense, symbol)}`,
      ]
      lines.push('', 'INCOME', '─'.repeat(40))
      filteredIncomes.forEach((i) => {
        lines.push(`${formatDate(i.date)} | ${i.source} | ${formatCurrency(i.amount, symbol)} | ${i.category}`)
      })
      lines.push('', 'EXPENSES', '─'.repeat(40))
      filteredExpenses.forEach((e) => {
        lines.push(`${formatDate(e.date)} | ${e.name} | ${formatCurrency(e.amount, symbol)} | ${e.category}`)
      })
      const previewText = lines.join('\n')
      const blob = new Blob([previewText], { type: 'text/plain;charset=utf-8' })
      return {
        blob,
        filename: `finflow-report-${options.dateFrom}.txt`,
        previewType: 'text',
        previewText,
      }
    }
    default:
      return buildExport('pdf', incomes, expenses, options, stats, symbol, userName)
  }
}

export function downloadExportResult(result: ExportBuildResult) {
  saveAs(result.blob, result.filename)
}

export function handleExport(
  format: ExportOptions['format'],
  incomes: Income[],
  expenses: Expense[],
  options: ExportOptions,
  stats: DashboardStats,
  symbol: string,
  userName: string
) {
  downloadExportResult(buildExport(format, incomes, expenses, options, stats, symbol, userName))
}
