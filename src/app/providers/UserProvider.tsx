import { Navigate, Outlet } from 'react-router-dom'
import { getToken } from '@/shared/lib/token'
import { useCurrentUser, UserContext } from '@/entities/user'
import styles from './UserProvider.module.css'

export function UserProvider() {
  const token = getToken()

  const { data, isLoading, isError } = useCurrentUser()

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
