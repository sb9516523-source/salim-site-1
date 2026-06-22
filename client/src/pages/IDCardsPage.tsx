import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Printer, ChevronDown, Loader2, RotateCcw, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import axios from 'axios'
import { ColorPicker } from '@/components/ColorPicker'

interface Template {
  id: string
  name: string
  layout: 'vertical' | 'horizontal'
  backgroundColor: string
  headerBgColor: string
  accentColor: string
  headerText: string
  subheaderText: string
  logo: string // 'preset-shield' | 'preset-star' | 'preset-eagle' | data URL
  signature: string // 'preset-sig1' | 'preset-sig2' | data URL
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

const defaultTemplate: Template = {
  id: 'default',
  name: 'Standard Dark',
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

export default function IDCardsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [employees, setEmployees] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [templates, setTemplates] = useState<Template[]>([defaultTemplate])
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(defaultTemplate)
  const [accentColor, setAccentColor] = useState('#d4af37')
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [empRes, tplRes] = await Promise.all([
        axios.get('/api/employees'),
        axios.get('/api/templates').catch(() => ({ data: [] }))
      ])

      const emps = empRes.data?.employees || empRes.data || []
      setEmployees(emps)
      if (emps.length > 0) setSelected(emps[0])

      const tpls = tplRes.data || []
      if (tpls.length > 0) {
        setTemplates([defaultTemplate, ...tpls])
        setSelectedTemplate(tpls[0])
        setAccentColor(tpls[0].accentColor || '#d4af37')
      } else {
        setTemplates([defaultTemplate])
        setSelectedTemplate(defaultTemplate)
        setAccentColor(defaultTemplate.accentColor)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const emp = selected
  const tpl = selectedTemplate
  const isHorizontal = tpl.layout === 'horizontal'

  // Presets
  const getPresetLogo = (type: string, color: string) => {
    const shieldSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    const eagleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`

    const svg = type === 'preset-star' ? starSvg : type === 'preset-eagle' ? eagleSvg : shieldSvg
    return 'data:image/svg+xml;base64,' + btoa(svg)
  }

  const getPresetSig = (type: string, color: string) => {
    const sig1Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40"><path d="M10,25 C30,10 50,35 70,15 C90,-5 110,30 130,20" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`
    const sig2Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40"><path d="M15,20 Q40,5 65,25 T115,15" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`

    const svg = type === 'preset-sig2' ? sig2Svg : sig1Svg
    return 'data:image/svg+xml;base64,' + btoa(svg)
  }

  const logoSrc = tpl.logo?.startsWith('preset-')
    ? getPresetLogo(tpl.logo, accentColor)
    : tpl.logo || getPresetLogo('preset-shield', accentColor)

  const sigSrc = emp?.documents?.signature
    ? emp.documents.signature
    : tpl.signature?.startsWith('preset-')
      ? getPresetSig(tpl.signature, '#000000')
      : tpl.signature || getPresetSig('preset-sig1', '#000000')

  const handleTemplateChange = (templateId: string) => {
    const t = templates.find(temp => temp.id === templateId) || defaultTemplate
    setSelectedTemplate(t)
    setAccentColor(t.accentColor || '#d4af37')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn('text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-black')}>
          ID Card System
        </h2>
        <p className={cn('text-sm mt-0.5', isDark ? 'text-white/40' : 'text-black/40')}>
          Generate and print professional employee ID cards
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-amber-400" size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* Card Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={cn('p-6 rounded-2xl border flex flex-col', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
          >
            <div className="flex items-center justify-between mb-6 shrink-0">
              <p className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-black')}>Card Preview</p>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setFlipped(f => !f)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer', isDark ? 'bg-white/8 hover:bg-white/12 text-white/70' : 'bg-black/5 hover:bg-black/8 text-black/60')}
              >
                <RotateCcw size={13} />
                Flip Card
              </motion.button>
            </div>

            {/* ID Card Wrapper */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div
                style={{
                  perspective: 1200,
                  width: isHorizontal ? 340 : 215,
                  height: isHorizontal ? 215 : 340,
                  transition: 'width 0.4s, height 0.4s'
                }}
              >
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                    style={{
                      backfaceVisibility: 'hidden',
                      background: tpl.backgroundColor || '#111115',
                      border: `1.5px solid ${accentColor}`,
                      color: '#ffffff'
                    }}
                  >
                    {/* Header bar */}
                    <div
                      className="p-2.5 flex items-center gap-2 border-b shrink-0"
                      style={{
                        background: tpl.headerBgColor || '#0a0a0d',
                        borderColor: `rgba(255, 255, 255, 0.08)`
                      }}
                    >
                      <img src={logoSrc} alt="Logo" className="w-5 h-5 object-contain" />
                      <div className="min-w-0">
                        <h4 className="text-[9px] font-extrabold tracking-wider truncate" style={{ color: accentColor }}>
                          {tpl.headerText || 'VALLEY SECURITY AGENCY'}
                        </h4>
                        <p className="text-[7px] text-white/40 tracking-widest truncate">
                          {tpl.subheaderText || 'SECURE ACCESS CONTROL'}
                        </p>
                      </div>
                    </div>

                    {/* Main Layout Area */}
                    {isHorizontal ? (
                      // Horizontal Layout
                      <div className="flex-1 p-3.5 flex gap-3.5 min-h-0">
                        {/* Left Side: Photo + QR */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          {tpl.fields?.photo && (
                            emp?.documents?.photo ? (
                              <img src={emp.documents.photo} alt="photo" className="w-[72px] h-[88px] object-cover rounded-lg border" style={{ borderColor: accentColor }} />
                            ) : (
                              <div className="w-[72px] h-[88px] rounded-lg flex items-center justify-center text-lg font-bold border" style={{ background: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}33` }}>
                                {(emp?.name || 'G')[0].toUpperCase()}
                              </div>
                            )
                          )}
                          {tpl.fields?.qrcode && (
                            <div className="w-[50px] h-[50px] rounded-md bg-white p-1 shrink-0 flex items-center justify-center shadow-inner">
                              <span className="text-[6px] text-black font-extrabold select-none">QR CODE</span>
                            </div>
                          )}
                        </div>

                        {/* Right Side: Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            {tpl.fields?.name && (
                              <h3 className="text-xs font-bold leading-tight truncate">{emp?.name || 'Guard Full Name'}</h3>
                            )}
                            {tpl.fields?.designation && (
                              <p className="text-[9px] font-semibold mt-0.5" style={{ color: accentColor }}>
                                {emp?.designation || 'Security Officer'}
                              </p>
                            )}
                            {tpl.fields?.department && emp?.department && (
                              <p className="text-[8px] text-white/50 truncate mt-0.5">{emp.department}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="grid grid-cols-2 gap-1 text-[8px]">
                              {tpl.fields?.empid && (
                                <div>
                                  <span className="text-white/35 block text-[7px] uppercase">Guard ID</span>
                                  <span className="font-mono text-white/80">{emp?.id || 'VSA-XXXX'}</span>
                                </div>
                              )}
                              {tpl.fields?.blood && emp?.bloodGroup && (
                                <div>
                                  <span className="text-white/35 block text-[7px] uppercase">Blood</span>
                                  <span className="font-bold text-red-400">{emp.bloodGroup}</span>
                                </div>
                              )}
                            </div>
                            {tpl.fields?.validity && (
                              <p className="text-[7.5px] font-mono text-white/30 border-t border-white/5 pt-1">
                                Valid: {emp?.joiningDate ? new Date(emp.joiningDate).getFullYear() : '2026'} - {emp?.joiningDate ? new Date(emp.joiningDate).getFullYear() + 3 : '2029'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Vertical Layout
                      <div className="flex-1 p-3.5 flex flex-col items-center justify-between text-center min-h-0">
                        {/* Top: Photo */}
                        {tpl.fields?.photo && (
                          emp?.documents?.photo ? (
                            <img src={emp.documents.photo} alt="photo" className="w-[76px] h-[92px] object-cover rounded-lg border" style={{ borderColor: accentColor }} />
                          ) : (
                            <div className="w-[76px] h-[92px] rounded-lg flex items-center justify-center text-lg font-bold border shrink-0" style={{ background: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}33` }}>
                              {(emp?.name || 'G')[0].toUpperCase()}
                            </div>
                          )
                        )}

                        {/* Mid: Title */}
                        <div className="mt-1 shrink-0">
                          {tpl.fields?.name && (
                            <h3 className="text-xs font-bold leading-tight truncate max-w-[190px]">{emp?.name || 'Guard Full Name'}</h3>
                          )}
                          {tpl.fields?.designation && (
                            <p className="text-[9px] font-semibold mt-0.5" style={{ color: accentColor }}>
                              {emp?.designation || 'Security Officer'}
                            </p>
                          )}
                          {tpl.fields?.department && emp?.department && (
                            <p className="text-[8px] text-white/50 truncate mt-0.5">{emp.department}</p>
                          )}
                        </div>

                        {/* Bottom: Details & QR row */}
                        <div className="w-full flex items-end justify-between border-t border-white/5 pt-2 mt-1">
                          <div className="text-left space-y-1">
                            {tpl.fields?.empid && (
                              <div>
                                <span className="text-white/35 block text-[6.5px] uppercase leading-none">Guard ID</span>
                                <span className="font-mono text-[8.5px] text-white/80">{emp?.id || 'VSA-XXXX'}</span>
                              </div>
                            )}
                            {tpl.fields?.validity && (
                              <p className="text-[6.5px] font-mono text-white/30">
                                Exp: {emp?.joiningDate ? new Date(emp.joiningDate).getFullYear() + 3 : '2029'}
                              </p>
                            )}
                          </div>

                          {tpl.fields?.qrcode && (
                            <div className="w-[42px] h-[42px] rounded-md bg-white p-0.5 flex items-center justify-center shrink-0">
                              <span className="text-[5.5px] text-black font-extrabold select-none">QR</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 text-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: '#0a0a0d',
                      border: `1.5px solid ${accentColor}`,
                      color: '#ffffff'
                    }}
                  >
                    <div className="space-y-1">
                      <div className="text-lg font-extrabold tracking-wider" style={{ color: accentColor }}>VSA</div>
                      <p className="text-white/40 text-[8px] uppercase tracking-widest">Verification Portal</p>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 my-2">
                      <div className="w-16 h-16 rounded-lg bg-white p-1 flex items-center justify-center">
                        <span className="text-[8px] text-black font-extrabold select-none">QR PORTAL</span>
                      </div>
                      <p className="text-[7.5px] text-white/30 max-w-[160px] leading-tight">
                        Scan QR code with any camera phone to verify guard credential records online.
                      </p>
                    </div>

                    {/* Signature Area */}
                    <div className="flex justify-between items-end border-t border-white/5 pt-2 text-left">
                      <div>
                        <p className="text-white/20 text-[6.5px] uppercase">Issued By</p>
                        <p className="text-[7.5px] font-bold text-white/60">VSA Command Office</p>
                      </div>
                      {tpl.fields?.signature && (
                        <div className="flex flex-col items-center">
                          <img src={sigSrc} alt="Signature" className="h-6 w-16 object-contain bg-white/5 rounded p-0.5" style={{ mixBlendMode: 'lighten' }} />
                          <p className="text-white/20 text-[6px] uppercase mt-0.5">Authorised Signatory</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Controls Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Employee Selector */}
            <div className={cn('p-4 rounded-2xl border', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}>
              <p className={cn('text-xs font-semibold uppercase tracking-wider mb-3', isDark ? 'text-white/40' : 'text-black/40')}>
                Select Guard
              </p>
              <div className="relative">
                <select
                  value={selected?.id || ''}
                  onChange={e => setSelected(employees.find(emp => emp.id === e.target.value))}
                  className={cn('w-full px-3 py-2.5 pr-8 rounded-xl text-sm appearance-none outline-none border cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white' : 'bg-white border-black/10 text-black')}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className={isDark ? 'bg-black text-white' : 'bg-white text-black'}>
                      {emp.name} — {emp.designation}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className={cn('absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none', isDark ? 'text-white/30' : 'text-black/30')} />
              </div>
            </div>

            {/* Template Selector */}
            <div className={cn('p-4 rounded-2xl border', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}>
              <p className={cn('text-xs font-semibold uppercase tracking-wider mb-3', isDark ? 'text-white/40' : 'text-black/40')}>
                Badge Template
              </p>
              <div className="relative">
                <select
                  value={tpl.id}
                  onChange={e => handleTemplateChange(e.target.value)}
                  className={cn('w-full px-3 py-2.5 pr-8 rounded-xl text-sm appearance-none outline-none border cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white' : 'bg-white border-black/10 text-black')}
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id} className={isDark ? 'bg-black text-white' : 'bg-white text-black'}>
                      {t.name} ({t.layout})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className={cn('absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none', isDark ? 'text-white/30' : 'text-black/30')} />
              </div>
            </div>

            {/* Accent color override */}
            <div className={cn('p-4 rounded-2xl border', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}>
              <p className={cn('text-xs font-semibold uppercase tracking-wider mb-3', isDark ? 'text-white/40' : 'text-black/40')}>
                Accent Override Color
              </p>
              <ColorPicker value={accentColor} onChange={setAccentColor} />
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-black cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #d4af37, #e8c547)', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}
                onClick={() => window.print()}
              >
                <Printer size={16} />
                Print / Download CR-80 Card
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
