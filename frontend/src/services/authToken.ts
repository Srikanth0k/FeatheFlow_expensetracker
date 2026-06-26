const TOKEN_KEY = 'finflow_auth_token'
const LEGACY_TOKEN_KEY = 'auth_token'

/** Read token from localStorage (survives browser restarts). */
export function getAuthToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) return token

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY)
  if (legacyToken) {
    localStorage.setItem(TOKEN_KEY, legacyToken)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    return legacyToken
  }

  // One-time migration from sessionStorage
  const sessionToken = sessionStorage.getItem(TOKEN_KEY)
  if (sessionToken) {
    localStorage.setItem(TOKEN_KEY, sessionToken)
    sessionStorage.removeItem(TOKEN_KEY)
    return sessionToken
  }

  return null
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

export function hasAuthToken(): boolean {
  return Boolean(getAuthToken())
}

/**
 * If the URL contains ?token=..., store it securely and remove it from the
 * address bar so the token is never visible to the user after load.
 */
export function captureTokenFromUrl(): void {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  if (!token) return

  setAuthToken(token)
  params.delete('token')

  const query = params.toString()
  const cleanUrl = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname

  window.history.replaceState({}, document.title, cleanUrl)
}
