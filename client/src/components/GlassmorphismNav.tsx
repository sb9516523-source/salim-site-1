import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Contact, Layout,
  FileText, BarChart3, Settings, Moon, Sun, ShieldCheck, LogOut
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

const GOLD = '#d4af37'

const NAV_ITEMS = [
  { name: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  { name: 'Employees', view: 'employees', icon: Users },
  { name: 'ID Cards', view: 'id-cards', icon: Contact },
  { name: 'Templates', view: 'templates', icon: Layout },
  { name: 'Records', view: 'emp-record', icon: FileText },
  { name: 'Reports', view: 'reports', icon: BarChart3 },
  { name: 'Settings', view: 'settings', icon: Settings },
]

interface Props {
  activeView: string
  onViewChange: (view: string) => void
}

export default function GlassmorphismNav({ activeView, onViewChange }: Props) {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const isDark = theme === 'dark'

  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.1 }}
        style={{ pointerEvents: 'auto' }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          padding: '6px 8px', borderRadius: 9999,
          background: isDark ? 'rgba(12,12,12,0.85)' : 'rgba(240,240,240,0.85)',
          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          boxShadow: isDark
            ? '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)'
            : '0 8px 40px rgba(0,0,0,0.15)',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 8px' }}>
            <ShieldCheck size={18} color={GOLD} />
            <span style={{ color: GOLD, fontWeight: 800, fontSize: 12, letterSpacing: '0.15em' }}>VSA</span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

          {/* Nav items */}
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeView === item.view
            return (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                style={{
                  position: 'relative', cursor: 'pointer', border: 'none', outline: 'none',
                  background: 'transparent', padding: '7px 14px', borderRadius: 9999,
                  color: isActive ? '#fff' : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  fontFamily: 'inherit', transition: 'color 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = isDark ? '#fff' : '#000' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
              >
                {/* Active background + lamp */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 9999,
                      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      zIndex: -1,
                    }}
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  >
                    {/* Gold lamp bar on top */}
                    <div style={{
                      position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)',
                      width: 28, height: 3, borderRadius: 9999,
                      background: GOLD,
                      boxShadow: `0 0 12px 3px rgba(212,175,55,0.6), 0 0 24px 8px rgba(212,175,55,0.3)`,
                    }} />
                  </motion.div>
                )}
                {/* Show icon on small, text on larger */}
                <span style={{ display: 'none' }}><Icon size={16} /></span>
                <span>{item.name}</span>
              </button>
            )
          })}

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              cursor: 'pointer', border: 'none', background: 'transparent', outline: 'none',
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              padding: 8, borderRadius: 9999, display: 'flex', alignItems: 'center',
              fontFamily: 'inherit', transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(255,255,255,0.1)'
              el.style.color = '#fff'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'transparent'
              el.style.color = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            aria-label="Logout"
            style={{
              cursor: 'pointer', border: 'none', background: 'transparent', outline: 'none',
              color: 'rgba(255,255,255,0.35)', padding: 8, borderRadius: 9999,
              display: 'flex', alignItems: 'center', fontFamily: 'inherit',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(239,68,68,0.15)'
              el.style.color = '#f87171'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'transparent'
              el.style.color = 'rgba(255,255,255,0.35)'
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
