import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useThemeStore, type ThemeMode } from '../../stores/useThemeStore'

const THEMES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
]

export function ThemePicker() {
  const themeMode = useThemeStore((s) => s.themeMode)
  const setThemeMode = useThemeStore((s) => s.setThemeMode)
  const current = THEMES.find((t) => t.id === themeMode) ?? THEMES[0]
  const CurrentIcon = current.icon

  return (
    <div className="relative shrink-0 w-full sm:w-auto sm:min-w-[148px]">
      <CurrentIcon
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
        aria-hidden
      />
      <select
        value={themeMode}
        onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
        aria-label="Theme"
        className={cn(
          'w-full appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)]',
          'py-2 pl-9 pr-8 text-sm font-medium text-[var(--color-text)]',
          'transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'
        )}
      >
        {THEMES.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
        aria-hidden
      />
    </div>
  )
}
