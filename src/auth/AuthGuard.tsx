import { Navigate, Outlet } from 'react-router-dom'
import { getToken } from '../lib/token'

export function AuthGuard() {
  if (!getToken()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
