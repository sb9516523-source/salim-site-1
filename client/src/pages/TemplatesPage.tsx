import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sliders, Save, Trash2, Edit2, Loader2, RefreshCw, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import axios from 'axios'
import { ColorPicker } from '@/components/ColorPicker'

interface Template {
  id?: string
  name: string
  layout: 'vertical' | 'horizontal'
  backgroundColor: string
  headerBgColor: string
  accentColor: string
  headerText: string
  subheaderText: string
  logo: string
  signature: string
  fields: {
    photo: boolean
    name: boolean
    designation: boolean
    department: boolean
    empid: boolean
    father: boolean
    phone: boolean
    email: boolean
    blood: boolean
    address: boolean
    signature: boolean
    qrcode: boolean
    validity: boolean
  }
}

const initialTemplateState: Template = {
  name: '',
  layout: 'horizontal',
  backgroundColor: '#111115',
  headerBgColor: '#0a0a0d',
  accentColor: '#d4af37',
  headerText: 'VALLEY SECURITY AGENCY',
  subheaderText: 'SECURE ACCESS CONTROL',
  logo: 'preset-shield',
  signature: 'preset-sig1',
  fields: {
    photo: true,
    name: true,
    designation: true,
    department: true,
    empid: true,
    father: true,
    phone: true,
    email: true,
    blood: true,
    address: true,
    signature: true,
    qrcode: true,
    validity: true
  }
}

export default function TemplatesPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formState, setFormState] = useState<Template>(initialTemplateState)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/templates')
      setTemplates(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldToggle = (field: keyof Template['fields']) => {
    setFormState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: !prev.fields[field]
      }
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormState(prev => ({ ...prev, [id]: value }))
  }

  const handleColorChange = (field: 'backgroundColor' | 'headerBgColor' | 'accentColor', color: string) => {
    setFormState(prev => ({ ...prev, [field]: color }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!formState.name) {
      setError('Template name is required')
      return
    }
    setSaving(true)
    try {
      const res = await axios.post('/api/templates', formState)
      const saved = res.data
      setTemplates(prev => {
        const idx = prev.findIndex(t => t.id === saved.id)
        if (idx !== -1) {
          return prev.map(t => t.id === saved.id ? saved : t)
        } else {
          return [...prev, saved]
        }
      })
      setFormState(initialTemplateState)
    } catch (err) {
      setError('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template permanently?')) return
    try {
      await axios.delete(`/api/templates/${id}`)
      setTemplates(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      alert('Failed to delete template')
    }
  }

  const handleEdit = (tpl: Template) => {
    setFormState({ ...tpl })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn('text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-black')}>
          Template Studio
        </h2>
        <p className={cn('text-sm mt-0.5', isDark ? 'text-white/40' : 'text-black/40')}>
          Design and customize badge templates layout and branding
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
        {/* Editor Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={cn('rounded-2xl border p-6 flex flex-col', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
        >
          <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Sliders size={16} className="text-amber-400" />
              Template Settings Form
            </h3>
            {formState.id && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Editing: {formState.id}
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {error && <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Template Name *</label>
                <input
                  id="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Standard Officer Card"
                  className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Card Layout</label>
                <select
                  id="layout"
                  value={formState.layout}
                  onChange={handleInputChange}
                  className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                >
                  <option value="horizontal">Horizontal (CR-80)</option>
                  <option value="vertical">Vertical Badge</option>
                </select>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase block">Accent Color</label>
                <ColorPicker value={formState.accentColor} onChange={c => handleColorChange('accentColor', c)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase block">Header Bg Color</label>
                <ColorPicker value={formState.headerBgColor} onChange={c => handleColorChange('headerBgColor', c)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase block">Card Bg Color</label>
                <ColorPicker value={formState.backgroundColor} onChange={c => handleColorChange('backgroundColor', c)} />
              </div>
            </div>

            {/* Typography & Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Header Main Text</label>
                <input
                  id="headerText"
                  value={formState.headerText}
                  onChange={handleInputChange}
                  placeholder="VALLEY SECURITY AGENCY"
                  className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Header Sub-Text</label>
                <input
                  id="subheaderText"
                  value={formState.subheaderText}
                  onChange={handleInputChange}
                  placeholder="SECURE ACCESS CONTROL"
                  className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                />
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Shield Emblem Logo</label>
                <select
                  id="logo"
                  value={formState.logo}
                  onChange={handleInputChange}
                  className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                >
                  <option value="preset-shield">Shield Security Icon</option>
                  <option value="preset-star">Military Star Icon</option>
                  <option value="preset-eagle">Eagle Defense Icon</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Officer Signature Preset</label>
                <select
                  id="signature"
                  value={formState.signature}
                  onChange={handleInputChange}
                  className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                >
                  <option value="preset-sig1">Signature Type 1</option>
                  <option value="preset-sig2">Signature Type 2</option>
                </select>
              </div>
            </div>

            {/* Enabled Fields Checkbox Checklist */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <label className="text-xs font-bold text-gray-400 uppercase block">Show Fields on Badge</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.keys(formState.fields).map(fieldKey => {
                  const key = fieldKey as keyof Template['fields']
                  const isChecked = formState.fields[key]
                  return (
                    <label key={key} className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFieldToggle(key)}
                        className="accent-amber-500 rounded border-white/10 bg-white/5"
                      />
                      <span className="capitalize">{key === 'empid' ? 'Guard ID' : key === 'qrcode' ? 'QR Code' : key}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Form actions */}
            <div className="flex gap-3 justify-end border-t border-white/5 pt-4">
              {formState.id && (
                <button
                  type="button"
                  onClick={() => setFormState(initialTemplateState)}
                  className={cn('px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer', isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5')}
                >
                  Clear Edit
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-black cursor-pointer transition-all"
                style={{ background: 'linear-gradient(135deg, #d4af37, #e8c547)', boxShadow: '0 4px 14px rgba(212,175,55,0.2)' }}
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save Template Layout
              </button>
            </div>
          </form>
        </motion.div>

        {/* Saved Templates List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={cn('rounded-2xl border p-4 flex flex-col', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
        >
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <Layers size={16} className="text-amber-400" />
            Saved Layout Templates
          </h3>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-amber-400" size={20} />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-500">No saved templates. Create one now.</div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
              {templates.map(tpl => (
                <div
                  key={tpl.id}
                  className={cn(
                    'p-3 rounded-xl border flex items-center justify-between group transition-all',
                    isDark ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.01]'
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-white">{tpl.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{tpl.layout}</p>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(tpl)}
                      className={cn('p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white cursor-pointer transition-colors')}
                      title="Edit template"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id!)}
                      className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 cursor-pointer transition-colors"
                      title="Delete template"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
