import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Mail, Lock } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuthStore } from '../../stores/useAuthStore'

type ResetPasswordData = {
  email: string
  newPassword: string
  confirmPassword: string
}

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    defaultValues: { email: '', newPassword: '', confirmPassword: '' },
  })

  const newPassword = watch('newPassword')

  const onSubmit = async (data: ResetPasswordData) => {
    setError(null)
    setLoading(true)
    try {
      await requestPasswordReset(data.email, data.newPassword, data.confirmPassword)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          Your password has been reset. You can now log in with your new password.
        </p>
        <Button type="button" className="w-full" onClick={onBack}>
          Back to login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </button>

      <p className="text-sm text-[var(--color-text-muted)]">
        Enter your account email and choose a new password.
      </p>

      <Input
        label="Email or username"
        type="text"
        placeholder="you@example.com"
        autoComplete="username"
        icon={<Mail className="h-4 w-4" />}
        {...register('email', {
          required: 'Email or username is required',
        })}
        error={errors.email?.message}
      />

      <Input
        label="New password"
        type="password"
        placeholder="At least 6 characters"
        autoComplete="new-password"
        icon={<Lock className="h-4 w-4" />}
        {...register('newPassword', {
          required: 'New password is required',
          minLength: { value: 6, message: 'Password must be at least 6 characters' },
        })}
        error={errors.newPassword?.message}
      />

      <Input
        label="Confirm new password"
        type="password"
        placeholder="Re-enter your new password"
        autoComplete="new-password"
        icon={<Lock className="h-4 w-4" />}
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (value) => value === newPassword || 'Passwords do not match',
        })}
        error={errors.confirmPassword?.message}
      />

      {error && (
        <p className="rounded-lg bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Reset password
      </Button>
    </form>
  )
}
