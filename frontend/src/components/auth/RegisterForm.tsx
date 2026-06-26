import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuthStore } from '../../stores/useAuthStore'

type RegisterFormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

function PasswordField({
  id,
  label,
  show,
  onToggle,
  error,
  placeholder,
  autoComplete,
  registration,
}: {
  id: string
  label: string
  show: boolean
  onToggle: () => void
  error?: string
  placeholder: string
  autoComplete: string
  registration: ReturnType<ReturnType<typeof useForm<RegisterFormData>>['register']>
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-muted)]">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          <Lock className="h-4 w-4" />
        </div>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] pl-10 pr-10 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60 transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          {...registration}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function RegisterForm() {
  const registerUser = useAuthStore((s) => s.register)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null)
    setLoading(true)
    try {
      await registerUser(data.name, data.email, data.password)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name"
        placeholder="Your full name"
        autoComplete="name"
        icon={<User className="h-4 w-4" />}
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Enter a valid email address',
          },
        })}
        error={errors.email?.message}
      />

      <PasswordField
        id="register-password"
        label="Password"
        show={showPassword}
        onToggle={() => setShowPassword((v) => !v)}
        placeholder="Create a password"
        autoComplete="new-password"
        error={errors.password?.message}
        registration={register('password', {
          required: 'Password is required',
          minLength: { value: 6, message: 'Password must be at least 6 characters' },
        })}
      />

      <PasswordField
        id="register-confirm-password"
        label="Confirm password"
        show={showConfirmPassword}
        onToggle={() => setShowConfirmPassword((v) => !v)}
        placeholder="Confirm your password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        registration={register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (value) => value === password || 'Passwords do not match',
        })}
      />

      {submitError && (
        <p className="rounded-lg bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {submitError}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Create account
      </Button>
    </form>
  )
}
