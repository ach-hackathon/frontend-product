import { createContext, useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getToken } from '../lib/token'
import { apiClient } from '../lib/apiClient'
import type { User, UserInfoResponse } from './lib/user'
import styles from './UserProvider.module.css'

const UserContext = createContext<User | null>(null)

export function useUser(): User {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}

export function UserProvider() {
  const token = getToken()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user/info'],
    queryFn: () => apiClient.get<UserInfoResponse>('/user/info'),
    enabled: !!token,
  })

  if (!token) {
    return <Navigate to="/error" replace />
  }

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (isError || !data?.data?.entity) {
    return <Navigate to="/error" replace />
  }

  return (
    <UserContext.Provider value={data.data.entity}>
      <Outlet />
    </UserContext.Provider>
  )
}
