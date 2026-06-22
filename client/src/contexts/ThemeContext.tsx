import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('vss-theme')
    return (stored as Theme) || 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.remove('light')
    } else {
      root.classList.add('light')
    }
    localStorage.setItem('vss-theme', theme)
  }, [theme])

  const toggleTheme = () => setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
  const setTheme = (t: Theme) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
