// Helper de autenticación del lado del cliente
// Maneja el token JWT en localStorage (más robusto que cookies en iframes cross-origin)

const TOKEN_KEY = 'autosync_token'
const USER_KEY = 'autosync_user'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function setStoredUser(user: any): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// fetch con Authorization header automático
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  // Asegurar credentials: include para mandar cookies también (si las hay)
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}

// Logout: limpia localStorage y manda request a la API para borrar cookie
export async function logout(): Promise<void> {
  clearToken()
  try {
    await authFetch('/api/auth/logout', { method: 'POST' })
  } catch {}
}
