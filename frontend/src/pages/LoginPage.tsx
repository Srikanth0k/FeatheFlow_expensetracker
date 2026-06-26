import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TrendingUp, Wallet, PieChart } from 'lucide-react'
import { cn } from '../utils/cn'
import { AppLogo } from '../components/ui/AppLogo'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm'

type AuthTab = 'login' | 'register'
type AuthView = AuthTab | 'forgot'

const tabs: { id: AuthTab; label: string }[] = [
  { id: 'login', label: 'Log in' },
  { id: 'register', label: 'Create account' },
]

export function LoginPage() {
  const [view, setView] = useState<AuthView>('login')

  const showForgotPassword = view === 'forgot'
  const currentTab = view === 'forgot' ? 'login' : view

  return (
    <div className="min-h-dvh bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="flex min-h-dvh flex-col lg:flex-row">
        {/* Brand panel — hidden on small mobile, compact on tablet, full on desktop */}
        <aside className="relative hidden overflow-hidden md:flex md:min-h-[220px] lg:min-h-dvh lg:w-[44%] xl:w-[48%]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 via-[var(--color-surface-2)] to-[var(--color-background)]" />
          <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-[var(--color-primary)]/15 blur-2xl" />

          <div className="relative z-10 flex flex-1 flex-col justify-between p-8 lg:p-12 xl:p-16">
            <div>
              <AppLogo size="lg" showName />
              <p className="mt-3 max-w-md text-base text-[var(--color-text-muted)] lg:text-lg">
                Track expenses, manage income, and stay on top of your finances — all in one place.
              </p>
            </div>

            <ul className="mt-8 hidden space-y-4 lg:block">
              {[
                { icon: Wallet, text: 'Smart expense tracking' },
                { icon: TrendingUp, text: 'Income & savings insights' },
                { icon: PieChart, text: 'Reports and analytics' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex flex-1 flex-col">
          <div className="flex items-center px-4 py-4 md:px-8 lg:px-12">
            <div className="md:hidden">
              <AppLogo size="lg" showName />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 pb-8 md:px-8 lg:px-12 lg:pb-12">
            <div className="w-full max-w-md">
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {showForgotPassword
                    ? 'Reset password'
                    : currentTab === 'login'
                      ? 'Welcome back'
                      : 'Create your account'}
                </h2>
                <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                  {showForgotPassword
                    ? 'Set a new password for your account'
                    : currentTab === 'login'
                      ? 'Sign in to continue to Featherflow'
                      : 'Start managing your finances today'}
                </p>
              </div>

              {!showForgotPassword && (
                <div
                  role="tablist"
                  aria-label="Authentication"
                  className="mb-6 flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1"
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={currentTab === tab.id}
                      onClick={() => setView(tab.id)}
                      className={cn(
                        'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200',
                        currentTab === tab.id
                          ? 'bg-[var(--color-surface-1)] text-[var(--color-text)] shadow-sm'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-surface-1)] p-5 shadow-sm md:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {view === 'login' && (
                      <LoginForm onForgotPassword={() => setView('forgot')} />
                    )}
                    {view === 'register' && <RegisterForm />}
                    {view === 'forgot' && (
                      <ForgotPasswordForm
                        onBack={() => setView('login')}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {!showForgotPassword && (
                <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
                  {currentTab === 'login' ? (
                    <>
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setView('register')}
                        className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                      >
                        Create account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setView('login')}
                        className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                      >
                        Log in
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
