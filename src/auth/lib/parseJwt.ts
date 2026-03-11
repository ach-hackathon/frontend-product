export function parseJwt<T = unknown>(token: string): T {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT format')

  const payload = parts[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(parts[1].length + (4 - (parts[1].length % 4)) % 4, '=')

  return JSON.parse(atob(payload)) as T
}
