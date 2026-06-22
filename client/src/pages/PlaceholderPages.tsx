import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn('text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-black')}>{title}</h2>
        <p className={cn('text-sm mt-0.5', isDark ? 'text-white/40' : 'text-black/40')}>{description}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className={cn('rounded-2xl border p-16 text-center', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
      >
        <div className="text-5xl mb-4">🚧</div>
        <p className={cn('text-sm font-medium', isDark ? 'text-white/40' : 'text-black/40')}>
          This section is being migrated from the legacy system.
        </p>
        <p className={cn('text-xs mt-1', isDark ? 'text-white/20' : 'text-black/20')}>
          Full functionality coming soon.
        </p>
      </motion.div>
    </div>
  )
}

export const TemplatesPage = () => <PlaceholderPage title="Templates" description="Design and manage ID card templates" />
export const EmployeeRecordPage = () => <PlaceholderPage title="Employee Records" description="Detailed employee records and documents" />
export const ReportsPage = () => <PlaceholderPage title="Reports" description="Analytics and workforce reports" />
export const SettingsPage = () => <PlaceholderPage title="Settings" description="System configuration and company profile" />
