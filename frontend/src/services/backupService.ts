import type { Income, Expense } from '../types'

export function exportDatabase(incomes: Income[], expenses: Expense[], settings: unknown) {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    incomes,
    expenses,
    settings,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finflow-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importDatabase(file: File): Promise<{
  incomes: Income[]
  expenses: Expense[]
  settings?: unknown
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (!data.incomes || !data.expenses) {
          reject(new Error('Invalid backup file format'))
          return
        }
        resolve({
          incomes: data.incomes,
          expenses: data.expenses,
          settings: data.settings,
        })
      } catch {
        reject(new Error('Failed to parse backup file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
