import { createContext, useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getToken } from '../lib/token'
import { parseJwt } from './lib/parseJwt'
import { jwtPayloadToUser, type JwtPayload, type User } from './lib/user'

const UserContext = createContext<User | null>(null)

export function useUser(): User {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}

export function UserProvider() {
  const token = getToken()

  if (!token) {
    return <Navigate to="/error" replace />
  }

  let user: User
  try {
    const payload = parseJwt<JwtPayload>(token)
    user = jwtPayloadToUser(payload)
  } catch {
    return <Navigate to="/error" replace />
  }

  return (
    <UserContext.Provider value={user}>
      <Outlet />
    </UserContext.Provider>
  )
}
