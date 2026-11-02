import { useEffect, useMemo, useState, useCallback, type ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { me } from '../../api/auth'
import { setUnauthorizedHandler } from '../../api/client'
import { AuthContext } from './auth-context'
import type { User } from '../../types/api'

interface AuthProviderProps {
  children: ReactNode
  queryClient: QueryClient
}

export function AuthProvider({ children, queryClient }: AuthProviderProps) {
  const [token, setToken] = useState(() => localStorage.getItem('kanbot_token'))
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(token))

  const logout = useCallback(() => {
    localStorage.removeItem('kanbot_token')
    setToken(null)
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(undefined)
  }, [logout])

  useEffect(() => {
    if (!token) return

    me()
      .then((response) => setUser(response?.user ?? null))
      .catch(() => logout())
      .finally(() => setIsLoading(false))
  }, [logout, token])

  const value = useMemo(
    () => ({
      isLoading,
      token,
      user,
      setSession: (nextToken: string, nextUser: User) => {
        localStorage.setItem('kanbot_token', nextToken)
        setToken(nextToken)
        setUser(nextUser)
      },
      logout,
    }),
    [isLoading, logout, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
