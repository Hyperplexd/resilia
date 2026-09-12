import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Role = 'resident' | 'authority'

type AuthState = {
  role: Role | null
  login: (role: Role) => void
  logout: () => void
}

const STORAGE_KEY = 'resilia.role'

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'resident' || stored === 'authority' ? stored : null
  })

  const login = useCallback((next: Role) => {
    window.localStorage.setItem(STORAGE_KEY, next)
    setRole(next)
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setRole(null)
  }, [])

  return <AuthContext.Provider value={{ role, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
