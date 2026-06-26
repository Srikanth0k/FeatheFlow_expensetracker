import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { INCOME_CATEGORIES } from '../../constants/categories'
import { getToday } from '../../utils/format'
import { useFinanceStore } from '../../stores/useFinanceStore'
import type { Income } from '../../types'

interface IncomeFormProps {
  onSuccess?: () => void
  editData?: Income | null
}

type FormData = {
  source: string
  amount: number
  date: string
  category: string
  notes: string
}

export function IncomeForm({ onSuccess, editData }: IncomeFormProps) {
  const addIncome = useFinanceStore((s) => s.addIncome)
  const updateIncome = useFinanceStore((s) => s.updateIncome)
  const isLoading = useFinanceStore((s) => s.isLoading)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: editData
      ? { source: editData.source, amount: editData.amount, date: editData.date, category: editData.category, notes: editData.notes || '' }
      : { source: '', amount: 0, date: getToday(), category: 'Salary', notes: '' },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      if (editData) {
        await updateIncome(editData.id, data)
      } else {
        await addIncome(data)
      }
      onSuccess?.()
    } catch (err) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setSubmitError(typeof detail === 'string' ? detail : err instanceof Error ? err.message : 'Failed to save income')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="space-y-4 p-5">
        <Input
          label="Income Source"
          placeholder="e.g. Salary, Freelancing"
          {...register('source', { required: 'Source is required' })}
          error={errors.source?.message}
        />
        <Input
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0"
          {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be positive' }, valueAsNumber: true })}
          error={errors.amount?.message}
        />
        <Input
          label="Date"
          type="date"
          {...register('date', { required: 'Date is required' })}
          error={errors.date?.message}
        />
        <Select
          label="Category"
          options={INCOME_CATEGORIES.map((c) => ({ value: c, label: c }))}
          {...register('category')}
        />
        <Input
          label="Notes (optional)"
          placeholder="Additional notes..."
          {...register('notes')}
        />
      </div>
      {submitError && (
        <p className="px-5 text-sm text-[var(--color-danger)]">{submitError}</p>
      )}
      <div className="shrink-0 p-5 pt-4 border-t border-[var(--color-border)]/50 bg-[var(--color-card)] safe-bottom">
        <Button type="submit" className="w-full" size="lg" loading={isLoading}>
          {editData ? 'Update Income' : 'Add Income'}
        </Button>
      </div>
    </form>
  )
}
