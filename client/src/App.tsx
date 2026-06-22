import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import GlassmorphismNav from '@/components/GlassmorphismNav'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import EmployeesPage from '@/pages/EmployeesPage'
import IDCardsPage from '@/pages/IDCardsPage'
import TemplatesPage from '@/pages/TemplatesPage'
import EmployeeRecordPage from '@/pages/EmployeeRecordPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'

function DashboardShell() {
  const { theme } = useTheme()
  const { isAuthenticated } = useAuth()
  const isDark = theme === 'dark'
  const [activeView, setActiveView] = useState('dashboard')

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const views: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    employees: <EmployeesPage />,
    'id-cards': <IDCardsPage />,
    templates: <TemplatesPage />,
    'emp-record': <EmployeeRecordPage />,
    reports: <ReportsPage />,
    settings: <SettingsPage />,
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#080808' : '#f4f4f5',
      transition: 'background 0.3s',
      position: 'relative',
    }}>
      {/* Dot grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: isDark
          ? 'radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)'
          : 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Gold glow orb top-left */}
      {isDark && (
        <div style={{
          position: 'fixed', top: -100, left: '10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(212,175,55,0.04)',
          filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
        }} />
      )}
      {/* Purple glow orb bottom-right */}
      {isDark && (
        <div style={{
          position: 'fixed', bottom: -100, right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(73,34,229,0.05)',
          filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
        }} />
      )}

      {/* Floating nav */}
      <GlassmorphismNav activeView={activeView} onViewChange={setActiveView} />

      {/* Main content */}
      <main style={{
        position: 'relative', zIndex: 1,
        paddingTop: 88, paddingBottom: 48,
        paddingLeft: 32, paddingRight: 32,
        maxWidth: 1400, margin: '0 auto',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {views[activeView] || <DashboardPage />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function LoginGuard() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <LoginPage />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginGuard />} />
            <Route path="/*" element={<DashboardShell />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
