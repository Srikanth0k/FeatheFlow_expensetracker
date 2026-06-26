import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../constants/categories'
import { getToday } from '../../utils/format'
import { useFinanceStore } from '../../stores/useFinanceStore'
import type { Expense, PaymentMethod } from '../../types'

interface ExpenseFormProps {
  onSuccess?: () => void
  editData?: Expense | null
}

type FormData = {
  name: string
  amount: number
  date: string
  category: string
  paymentMethod: PaymentMethod
  notes: string
}

export function ExpenseForm({ onSuccess, editData }: ExpenseFormProps) {
  const addExpense = useFinanceStore((s) => s.addExpense)
  const updateExpense = useFinanceStore((s) => s.updateExpense)
  const isLoading = useFinanceStore((s) => s.isLoading)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: editData
      ? { name: editData.name, amount: editData.amount, date: editData.date, category: editData.category, paymentMethod: editData.paymentMethod, notes: editData.notes || '' }
      : { name: '', amount: 0, date: getToday(), category: 'Food', paymentMethod: 'upi', notes: '' },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      if (editData) {
        await updateExpense(editData.id, data)
      } else {
        await addExpense(data)
      }
      onSuccess?.()
    } catch (err) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setSubmitError(typeof detail === 'string' ? detail : err instanceof Error ? err.message : 'Failed to save expense')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="space-y-4 p-5">
        <Input
          label="Expense Name"
          placeholder="e.g. Grocery shopping"
          {...register('name', { required: 'Name is required' })}
          error={errors.name?.message}
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
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
          {...register('category')}
        />
        <Select
          label="Payment Method"
          options={PAYMENT_METHODS.map((p) => ({ value: p.value, label: p.label }))}
          {...register('paymentMethod')}
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
          {editData ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  )
}
