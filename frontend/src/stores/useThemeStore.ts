import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  applyThemeToDOM: () => void
  isDark: boolean
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return mode === 'dark'
}

function applyTheme(isDark: boolean) {
  const root = document.documentElement
  root.classList.toggle('theme-dark', isDark)
  root.classList.toggle('theme-light', !isDark)
  root.classList.toggle('dark', isDark)
  root.classList.toggle('light', !isDark)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', isDark ? '#121212' : '#F8F9FA')
  }
}

let systemListenerAttached = false

function attachSystemListener(reapply: () => void) {
  if (systemListenerAttached || typeof window === 'undefined') return
  systemListenerAttached = true
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const mode = useThemeStore.getState().themeMode
    if (mode === 'system') reapply()
  })
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'light',
      isDark: false,

      setThemeMode: (mode) => {
        const isDark = resolveIsDark(mode)
        set({ themeMode: mode, isDark })
        applyTheme(isDark)
      },

      applyThemeToDOM: () => {
        const isDark = resolveIsDark(get().themeMode)
        set({ isDark })
        applyTheme(isDark)
        attachSystemListener(() => get().applyThemeToDOM())
      },
    }),
    {
      name: 'finflow-theme',
      version: 1,
      partialize: (state) => ({ themeMode: state.themeMode }),
      migrate: (persisted) => {
        if (persisted && typeof persisted === 'object' && 'themeMode' in persisted) {
          return persisted as { themeMode: ThemeMode }
        }
        const legacy = persisted as { isDark?: boolean } | undefined
        return { themeMode: legacy?.isDark ? 'dark' : 'light' }
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.applyThemeToDOM()
      },
    }
  )
)
