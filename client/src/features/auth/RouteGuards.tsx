import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  return <Outlet />
}

export function GuestRoute() {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return null
  }
  return user ? <Navigate to="/projects" replace /> : <Outlet />
}
