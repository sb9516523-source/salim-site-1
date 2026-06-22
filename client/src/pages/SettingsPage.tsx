import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DownloadCloud, UploadCloud, Shield, Info, Database, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import axios from 'axios'

interface Classifications {
  departments: string[]
  designations: string[]
  manpowerTypes: string[]
}

interface DbStatus {
  success: boolean
  usePostgres: boolean
  postgresOnline: boolean
  databaseType: string
}

export default function SettingsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [loading, setLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null)
  const [classifications, setClassifications] = useState<Classifications>({
    departments: [],
    designations: [],
    manpowerTypes: []
  })

  // Tab State for Classifications
  const [activeClassTab, setActiveClassTab] = useState<'depts' | 'desigs' | 'types'>('depts')
  const [newInput, setNewInput] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const [statusRes, classRes] = await Promise.all([
        axios.get('/api/db-status').catch(() => ({ data: { success: false, databaseType: 'Local Database (Offline Fallback)' } })),
        axios.get('/api/classifications').catch(() => ({ data: { departments: [], designations: [], manpowerTypes: [] } }))
      ])
      setDbStatus(statusRes.data as DbStatus)
      setClassifications(classRes.data as Classifications)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Backup Export
  const handleExportBackup = async () => {
    try {
      const res = await axios.get('/api/db')
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `VSA_Database_Backup_${new Date().toISOString().split('T')[0]}.json`)
      downloadAnchor.click()
      showFlashMessage('Database backup exported successfully!', 'success')
    } catch (err) {
      showFlashMessage('Failed to export backup.', 'error')
    }
  }

  // Backup Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!confirm('Importing this file will overwrite all current guards, sites, and templates. Are you sure?')) {
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const payload = JSON.parse(reader.result as string)
        const res = await axios.post('/api/db/import', payload)
        if (res.data.success) {
          showFlashMessage('Database backup imported successfully! Reloading data...', 'success')
          setTimeout(() => window.location.reload(), 1500)
        } else {
          showFlashMessage(res.data.error || 'Import failed.', 'error')
        }
      } catch (err) {
        showFlashMessage('Invalid backup JSON format.', 'error')
      }
    }
    reader.readAsText(file)
  }

  const showFlashMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  // Classifications management
  const handleAddClassification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInput.trim()) return

    const keyMap = {
      depts: 'departments',
      desigs: 'designations',
      types: 'manpowerTypes'
    }
    const currentKey = keyMap[activeClassTab] as keyof Classifications
    const updatedList = [...classifications[currentKey], newInput.trim()]

    const payload = {
      ...classifications,
      [currentKey]: updatedList
    }

    setActionLoading(true)
    try {
      const res = await axios.post('/api/classifications', payload)
      setClassifications(res.data)
      setNewInput('')
      showFlashMessage('Category added successfully!', 'success')
    } catch (err) {
      showFlashMessage('Failed to update categories.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteClassification = async (index: number) => {
    const keyMap = {
      depts: 'departments',
      desigs: 'designations',
      types: 'manpowerTypes'
    }
    const currentKey = keyMap[activeClassTab] as keyof Classifications
    const itemToRemove = classifications[currentKey][index]

    if (!confirm(`Are you sure you want to remove "${itemToRemove}"?`)) {
      return
    }

    const updatedList = classifications[currentKey].filter((_, i) => i !== index)
    const payload = {
      ...classifications,
      [currentKey]: updatedList
    }

    setActionLoading(true)
    try {
      const res = await axios.post('/api/classifications', payload)
      setClassifications(res.data)
      showFlashMessage('Category deleted successfully!', 'success')
    } catch (err) {
      showFlashMessage('Failed to update categories.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn('text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-black')}>
          System Settings
        </h2>
        <p className={cn('text-sm mt-0.5', isDark ? 'text-white/40' : 'text-black/40')}>
          Manage configuration backups, manpower rosters, and metadata categories
        </p>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border',
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            )}
          >
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-amber-400" size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Backups Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn('rounded-2xl border p-6 space-y-4', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
          >
            <h3 className="text-sm font-bold flex items-center gap-2 border-b border-white/5 pb-2">
              <Database size={16} className="text-amber-400" />
              Local Database Backups
            </h3>
            <p className={cn('text-xs leading-relaxed', isDark ? 'text-white/45' : 'text-black/45')}>
              Export or import the full database file. This contains all guards, client deployments, and card configurations. Safe for sharing or migrations.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleExportBackup}
                className={cn('w-full flex items-center justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer', isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-black')}
              >
                <DownloadCloud size={16} className="text-amber-500" />
                Export Backup JSON File
              </button>
              <div>
                <label className={cn('w-full flex items-center justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer', isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-black')}>
                  <UploadCloud size={16} className="text-amber-500" />
                  Import Backup File...
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportBackup}
                  />
                </label>
              </div>
            </div>
          </motion.div>

          {/* Company Profile Info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className={cn('rounded-2xl border p-6 space-y-4', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
          >
            <h3 className="text-sm font-bold flex items-center gap-2 border-b border-white/5 pb-2">
              <Shield size={16} className="text-amber-400" />
              Company Profile Information
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Agency Name</span>
                <input
                  disabled
                  value="Valley Security Service Agency"
                  className={cn('w-full px-3 py-2 rounded-xl border outline-none opacity-60', isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black')}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Corporate Office Address</span>
                <input
                  disabled
                  value="SHAHEED GUNJ NATH COMPLEX SRINAGAR 190001"
                  className={cn('w-full px-3 py-2 rounded-xl border outline-none opacity-60', isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black')}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Licence / PSARA Registration Number</span>
                <input
                  disabled
                  value="PSA | L | 99 | JK |2024 | DEC | 3| 62"
                  className={cn('w-full px-3 py-2 rounded-xl border outline-none opacity-60', isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black')}
                />
              </div>
            </div>
          </motion.div>

          {/* Manpower Classifications Manager */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={cn('rounded-2xl border p-6 space-y-4 lg:col-span-2', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
          >
            <h3 className="text-sm font-bold flex items-center gap-2 border-b border-white/5 pb-2">
              <Database size={16} className="text-amber-400" />
              Manpower Classifications Manager
            </h3>
            <p className={cn('text-xs leading-relaxed', isDark ? 'text-white/45' : 'text-black/45')}>
              Configure custom departments, roles, and manpower groupings used for registering guards and tracking roster statistics.
            </p>

            {/* Classification Tabs */}
            <div className="flex border-b border-white/5">
              {(['depts', 'desigs', 'types'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setActiveClassTab(tab); setNewInput('') }}
                  className={cn(
                    'px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer',
                    activeClassTab === tab
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-gray-500 hover:text-gray-400'
                  )}
                >
                  {tab === 'depts' ? 'Departments' : tab === 'desigs' ? 'Designations' : 'Manpower Types'}
                </button>
              ))}
            </div>

            {/* List and add form */}
            <div className="space-y-4">
              {/* Chips List */}
              <div className="flex flex-wrap gap-2 min-h-12 p-3.5 rounded-xl border border-white/5 bg-white/[0.02] items-center">
                {classifications[
                  activeClassTab === 'depts' ? 'departments' : activeClassTab === 'desigs' ? 'designations' : 'manpowerTypes'
                ].length === 0 ? (
                  <span className="text-xs text-gray-500">None configured. Add one below.</span>
                ) : (
                  classifications[
                    activeClassTab === 'depts' ? 'departments' : activeClassTab === 'desigs' ? 'designations' : 'manpowerTypes'
                  ].map((item, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
                        isDark ? 'border-white/10 bg-white/5 text-white/80' : 'border-black/10 bg-black/5 text-black/80'
                      )}
                    >
                      {item}
                      <button
                        onClick={() => handleDeleteClassification(idx)}
                        disabled={actionLoading}
                        className="text-gray-500 hover:text-red-400 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add form */}
              <form onSubmit={handleAddClassification} className="flex gap-2">
                <input
                  value={newInput}
                  onChange={e => setNewInput(e.target.value)}
                  placeholder={
                    activeClassTab === 'depts'
                      ? 'e.g. Roster Management, Healthcare Services...'
                      : activeClassTab === 'desigs'
                        ? 'e.g. Site Manager, Bouncer...'
                        : 'e.g. Skilled Force, Drivers...'
                  }
                  className={cn('flex-1 px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                />
                <button
                  type="submit"
                  disabled={actionLoading || !newInput.trim()}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-black cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed h-[38px]"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #e8c547)' }}
                >
                  <Plus size={13} />
                  Add Category
                </button>
              </form>
            </div>
          </motion.div>

          {/* System Info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className={cn('rounded-2xl border p-6 space-y-4 lg:col-span-2', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
          >
            <h3 className="text-sm font-bold flex items-center gap-2 border-b border-white/5 pb-2">
              <Info size={16} className="text-amber-400" />
              System Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-left">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Application Name</span>
                <p className="font-bold text-white">Valley Security Service Agency</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Database Engine</span>
                <p className="font-bold text-white">{dbStatus?.databaseType || 'Connecting...'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Software Version</span>
                <p className="font-bold text-white">1.0.0 Professional</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Lead Developer</span>
                <p className="font-bold text-amber-400 font-mono">SALIM ILYAS BHAT</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
