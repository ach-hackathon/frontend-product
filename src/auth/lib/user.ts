export interface JwtPayload {
  aud: string
  exp: number
  iss: string
  scope: string
  sub: string
  unique_name: string
  display_name?: string
}

export interface User {
  sub: string
  email: string
  scope: string
  displayName: string
}

export function jwtPayloadToUser(payload: JwtPayload): User {
  return {
    sub: payload.sub,
    email: payload.unique_name,
    scope: payload.scope,
    displayName: payload.display_name ?? 'Anonymous',
  }
}
