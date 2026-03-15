import Cookies from 'js-cookie'

const TOKEN_KEY = 'access_token'

function getCookieOptions(expires?: Date): Cookies.CookieAttributes {
  const base: Cookies.CookieAttributes = {
    sameSite: 'Lax',
    path: '/',
  }

  if (!import.meta.env.DEV) {
    base.domain = import.meta.env.VITE_COOKIE_DOMAIN
    base.secure = true
  }

  if (expires) {
    base.expires = expires
  }

  return base
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY) ?? undefined
}

export function setToken(token: string, expiresAtUtc?: string): void {
  const expires = expiresAtUtc ? new Date(expiresAtUtc) : undefined
  Cookies.set(TOKEN_KEY, token, getCookieOptions(expires))
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY, getCookieOptions())
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // localStorage may be unavailable in some contexts
  }
}
