import { Navigate, Outlet } from 'react-router-dom'
import { getToken } from '@/shared/lib/token'

export function AuthGuard() {
  if (!getToken()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
