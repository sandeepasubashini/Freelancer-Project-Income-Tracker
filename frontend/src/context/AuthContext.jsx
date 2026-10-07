import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, TOKEN_KEY } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await api.login(credentials)
    const { token, user: authenticatedUser } = response.data
    localStorage.setItem(TOKEN_KEY, token)
    setUser(authenticatedUser)
    return authenticatedUser
  }, [])

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.getCurrentUser()
        if (isMounted) {
          setUser(response.data.user)
        }
      } catch (error) {
        if (error.status === 401) {
          localStorage.removeItem(TOKEN_KEY)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()
    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: Boolean(user), login, logout }),
    [user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }
  return context
}
