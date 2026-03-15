import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getToken } from '@/shared/lib/token'

export function AuthGuard() {
  const location = useLocation()

  if (!getToken()) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  return <Outlet />
}
