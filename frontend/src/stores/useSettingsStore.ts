import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings } from '../types'
import { DEFAULT_SETTINGS } from '../constants/categories'

interface SettingsState extends UserSettings {
  updateSettings: (settings: Partial<UserSettings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (settings) => set((s) => ({ ...s, ...settings })),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    { name: 'finflow-settings' }
  )
)
