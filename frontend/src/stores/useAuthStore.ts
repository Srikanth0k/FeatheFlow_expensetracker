import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import { Auth, type AuthUserResponse } from '../services/api'
import { getAuthToken, setAuthToken, clearAuthToken, captureTokenFromUrl, hasAuthToken } from '../services/authToken'
import { environment } from '../config/environment'
import { useSettingsStore } from './useSettingsStore'
import { useFinanceStore } from './useFinanceStore'

export interface AuthUser {
  id: number
  name: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  entryTab: string | null
  login: (identifier: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  bootstrapAuth: () => Promise<void>
  clearEntryTab: () => void
  logout: () => Promise<void>
  requestPasswordReset: (email: string, newPassword: string, confirmPassword: string) => Promise<void>
}

let bootstrapPromise: Promise<void> | null = null
let sessionReady = false

function toAuthUser(user: AuthUserResponse): AuthUser {
  return {
    id: user.id,
    name: user.username,
    email: user.email || '',
  }
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
  }
  return err instanceof Error ? err.message : fallback
}

function applyUserSession(user: AuthUser, token: string) {
  setAuthToken(token)
  useSettingsStore.getState().updateSettings({ userName: user.name })
}

async function loadInitialData() {
  if (hasAuthToken() || !environment.useLocalStorage) {
    await useFinanceStore.getState().fetchTransactions()
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isBootstrapping: true,
      entryTab: null,

      bootstrapAuth: async () => {
        if (sessionReady) {
          set({ isBootstrapping: false })
          return
        }
        if (bootstrapPromise) return bootstrapPromise

        bootstrapPromise = (async () => {
          captureTokenFromUrl()

          const token = getAuthToken()
          if (!token) {
            set({ isBootstrapping: false, isAuthenticated: false, user: null })
            return
          }

          try {
            const { data } = await Auth.me()
            const user = toAuthUser(data)
            useSettingsStore.getState().updateSettings({ userName: user.name })
            await loadInitialData()
            sessionReady = true
            set({ user, isAuthenticated: true, isBootstrapping: false })
          } catch {
            clearAuthToken()
            set({ user: null, isAuthenticated: false, isBootstrapping: false })
          }
        })()

        return bootstrapPromise
      },

      login: async (identifier, password) => {
        try {
          const { data } = await Auth.login({ identifier, password })
          const user = toAuthUser(data.user)
          applyUserSession(user, data.access_token)
          sessionReady = true
          await loadInitialData()
          set({ user, isAuthenticated: true, isBootstrapping: false })
        } catch (err) {
          throw new Error(getErrorMessage(err, 'Login failed'))
        }
      },

      register: async (name, email, password) => {
        const username = name.trim()
        const trimmedEmail = email.trim().toLowerCase()

        if (!username || !trimmedEmail) {
          throw new Error('Name and email are required')
        }

        try {
          const { data } = await Auth.register({
            username,
            email: trimmedEmail,
            password,
          })
          const user = toAuthUser(data.user)
          applyUserSession(user, data.access_token)
          sessionReady = true
          await loadInitialData()
          set({ user, isAuthenticated: true, isBootstrapping: false })
        } catch (err) {
          throw new Error(getErrorMessage(err, 'Could not create account'))
        }
      },

      clearEntryTab: () => set({ entryTab: null }),

      logout: async () => {
        try {
          if (hasAuthToken()) {
            await Auth.clearDeviceToken()
          }
        } catch {
          // Still sign out locally if the server call fails.
        } finally {
          clearAuthToken()
          sessionReady = false
          bootstrapPromise = null
          useFinanceStore.getState().resetTransactions()
          set({ user: null, isAuthenticated: false, isBootstrapping: false })
        }
      },

      requestPasswordReset: async (email, newPassword, confirmPassword) => {
        try {
          await Auth.forgotPassword(email.trim(), newPassword, confirmPassword)
        } catch (err) {
          throw new Error(getErrorMessage(err, 'Could not reset password'))
        }
      },
    }),
    {
      name: 'finflow-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
