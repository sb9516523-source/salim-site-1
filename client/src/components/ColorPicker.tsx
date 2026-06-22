import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ─── Color Math Utilities ─── */
function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }

function hsbToRgb(h: number, s: number, b: number) {
  s /= 100; b /= 100
  const k = (n: number) => (n + h / 60) % 6
  const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)))
  return { r: Math.round(255 * f(5)), g: Math.round(255 * f(3)), b: Math.round(255 * f(1)) }
}

function rgbToHsb(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min
  let h = 0
  if (delta) {
    if (max === r) h = 60 * (((g - b) / delta) % 6)
    else if (max === g) h = 60 * ((b - r) / delta + 2)
    else h = 60 * ((r - g) / delta + 4)
  }
  return { h: (h + 360) % 360, s: max === 0 ? 0 : (delta / max) * 100, b: max * 100 }
}

function toHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function parseHex(hex: string): { h: number; s: number; b: number } | null {
  const clean = hex.replace('#', '')
  if (!/^[a-f0-9]{6}$/i.test(clean)) return null
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b2 = parseInt(clean.slice(4, 6), 16)
  return rgbToHsb(r, g, b2)
}

const PRESET_COLORS = [
  '#D4AF37', // Brushed Gold
  '#0485F7', // Electric Blue
  '#DC2626', // Crimson
  '#16A34A', // Emerald
  '#7C3AED', // Violet
  '#EA580C', // Orange
  '#0891B2', // Cyan
  '#DB2777', // Pink
]

interface ColorPickerProps {
  value?: string
  onChange?: (hex: string) => void
  className?: string
}

export function ColorPicker({ value = '#D4AF37', onChange, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const parsed = parseHex(value) || { h: 43, s: 74, b: 83 }
  const [hsb, setHsb] = useState(parsed)
  const [hexInput, setHexInput] = useState(value.toUpperCase())
  const areaRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const draggingArea = useRef(false)
  const draggingHue = useRef(false)

  const rgb = hsbToRgb(hsb.h, hsb.s, hsb.b)
  const currentHex = toHex(rgb.r, rgb.g, rgb.b)

  useEffect(() => {
    setHexInput(currentHex)
    onChange?.(currentHex)
  }, [hsb.h, hsb.s, hsb.b])

  /* ─── Area pointer events ─── */
  const updateArea = useCallback((clientX: number, clientY: number) => {
    const box = areaRef.current?.getBoundingClientRect()
    if (!box) return
    const s = clamp(((clientX - box.left) / box.width) * 100, 0, 100)
    const b = clamp(100 - ((clientY - box.top) / box.height) * 100, 0, 100)
    setHsb(prev => ({ ...prev, s, b }))
  }, [])

  const updateHue = useCallback((clientX: number) => {
    const box = hueRef.current?.getBoundingClientRect()
    if (!box) return
    const h = clamp(((clientX - box.left) / box.width) * 360, 0, 360)
    setHsb(prev => ({ ...prev, h }))
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (draggingArea.current) updateArea(e.clientX, e.clientY)
      if (draggingHue.current) updateHue(e.clientX)
    }
    const onUp = () => { draggingArea.current = false; draggingHue.current = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [updateArea, updateHue])

  const hueRgb = hsbToRgb(hsb.h, 100, 100)
  const hueHex = toHex(hueRgb.r, hueRgb.g, hueRgb.b)

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Trigger swatch */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors cursor-pointer group"
      >
        <span
          className="w-6 h-6 rounded-lg border border-white/20 shrink-0 shadow-inner"
          style={{ background: currentHex }}
        />
        <span className="text-sm font-mono text-white/70 group-hover:text-white/90 transition-colors">
          {currentHex}
        </span>
      </button>

      {/* Picker popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute left-0 top-[calc(100%+8px)] z-50 rounded-2xl p-4 border border-white/10 w-64 shadow-2xl"
            style={{
              background: 'rgba(10,10,10,0.95)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Color Area */}
            <div
              ref={areaRef}
              className="relative w-full h-40 rounded-xl mb-3 cursor-crosshair select-none"
              style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueHex})`,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
              }}
              onPointerDown={e => {
                draggingArea.current = true
                ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
                updateArea(e.clientX, e.clientY)
              }}
            >
              {/* Thumb */}
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${hsb.s}%`,
                  top: `${100 - hsb.b}%`,
                  background: currentHex,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}
              />
            </div>

            {/* Hue Slider */}
            <div className="mb-4">
              <div
                ref={hueRef}
                className="relative h-3 rounded-full cursor-pointer select-none"
                style={{
                  background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)',
                }}
                onPointerDown={e => {
                  draggingHue.current = true
                  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
                  updateHue(e.clientX)
                }}
              >
                <div
                  className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white -translate-y-1/2 -translate-x-1/2 pointer-events-none"
                  style={{
                    left: `${(hsb.h / 360) * 100}%`,
                    background: hueHex,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}
                />
              </div>
            </div>

            {/* Hex Input + current swatch */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-8 h-8 rounded-lg border border-white/20 shrink-0"
                style={{ background: currentHex }}
              />
              <div
                className="flex-1 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5"
              >
                <span className="text-xs text-white/30 font-mono">#</span>
                <input
                  type="text"
                  value={hexInput.replace('#', '')}
                  onChange={e => {
                    const v = '#' + e.target.value.toUpperCase()
                    setHexInput(v)
                    const parsed = parseHex(v)
                    if (parsed) setHsb(parsed)
                  }}
                  className="flex-1 bg-transparent text-sm font-mono text-white/80 outline-none w-full"
                  maxLength={6}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Presets */}
            <div>
              <p className="text-xs text-white/30 mb-2 font-medium uppercase tracking-wider">Presets</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      const p = parseHex(color)
                      if (p) setHsb(p)
                    }}
                    className={cn(
                      'w-6 h-6 rounded-lg border transition-all hover:scale-110',
                      currentHex.toUpperCase() === color.toUpperCase()
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-white/20'
                    )}
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ColorPicker
