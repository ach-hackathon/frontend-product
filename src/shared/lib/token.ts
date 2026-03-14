import Cookies from 'js-cookie'

const TOKEN_KEY = 'access_token'

const cookieOptions: Cookies.CookieAttributes = import.meta.env.DEV
  ? { sameSite: 'Lax' }
  : { domain: import.meta.env.VITE_COOKIE_DOMAIN, secure: true, sameSite: 'Lax' }

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, cookieOptions)
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY, cookieOptions)
}
