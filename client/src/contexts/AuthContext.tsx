import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

interface User {
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check session on mount
    const stored = localStorage.getItem('vss-user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/login', { email, password })
    if (res.data.success) {
      setUser(res.data.user)
      localStorage.setItem('vss-user', JSON.stringify(res.data.user))
    } else {
      throw new Error(res.data.error || 'Login failed')
    }
  }

  const logout = async () => {
    await axios.post('/api/logout').catch(() => {})
    setUser(null)
    localStorage.removeItem('vss-user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
