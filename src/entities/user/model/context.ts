import { createContext, useContext } from 'react'
import type { User } from './types'

export const UserContext = createContext<User | null>(null)

export function useUser(): User {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
