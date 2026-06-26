import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuthStore } from '../../stores/useAuthStore'

type LoginFormData = {
  identifier: string
  password: string
}

interface LoginFormProps {
  onForgotPassword: () => void
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { identifier: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null)
    setLoading(true)
    try {
      await login(data.identifier, data.password)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name or email"
        placeholder="Enter your name or email"
        autoComplete="username"
        icon={<Mail className="h-4 w-4" />}
        {...register('identifier', { required: 'Name or email is required' })}
        error={errors.identifier?.message}
      />

      <div className="space-y-1.5">
        <label htmlFor="login-password" className="block text-sm font-medium text-[var(--color-text-muted)]">
          Password
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] pl-10 pr-10 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60 transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            {...register('password', { required: 'Password is required' })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
      </div>

      {submitError && (
        <p className="rounded-lg bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {submitError}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Log in
      </Button>

      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
        >
          Forgot password?
        </button>
      </div>
    </form>
  )
}
