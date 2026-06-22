import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const EASE = [0.16, 1, 0.3, 1] as const
const GOLD = '#d4af37'

function GlowHorizon() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '55vh', overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Black base */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          borderRadius: '100%',
          background: '#000',
          filter: 'blur(51px)',
          scale: 1.2,
        }}
        initial={{ y: '-100%', opacity: 0 }}
        animate={{ y: '-50%', opacity: 1 }}
        transition={{ duration: 2, ease: EASE }}
      />
      {/* Indigo glow */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          borderRadius: '100%',
          background: '#4922E5',
          filter: 'blur(21px)',
          scale: 1.24,
        }}
        initial={{ y: '-100%', opacity: 0 }}
        animate={{ y: '-50%', opacity: 1 }}
        transition={{ duration: 2, ease: EASE, delay: 0 }}
      />
      {/* Purple glow */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          borderRadius: '100%',
          background: '#A558FB',
          filter: 'blur(31px)',
          scale: 1.2,
        }}
        initial={{ y: '-100%', opacity: 0 }}
        animate={{ y: '-50%', opacity: 1 }}
        transition={{ duration: 2, ease: EASE, delay: 0.6 }}
      />
      {/* White arc */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          borderRadius: '100%',
          background: '#FFFFFF',
          scale: 1.32,
          boxShadow: '0px -4px 23px 0px rgba(255,255,255,0.7)',
        }}
        initial={{ y: '-100%', opacity: 0 }}
        animate={{ y: '-50%', opacity: 1 }}
        transition={{ duration: 2, ease: EASE, delay: 1.2 }}
      />
    </div>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'relative', minHeight: '100vh', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050507',
    }}>
      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Glow Horizon */}
      <GlowHorizon />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, margin: '0 16px' }}
      >
        <div style={{
          borderRadius: 28,
          padding: '40px 36px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.06))',
              border: '1px solid rgba(212,175,55,0.35)',
              boxShadow: '0 8px 32px rgba(212,175,55,0.2)',
              marginBottom: 20,
            }}>
              <ShieldCheck size={32} color={GOLD} strokeWidth={1.5} />
            </div>
            <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', fontFamily: 'inherit' }}>
              Valley Security
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6 }}>
              Admin Portal — Secure Access Only
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Email */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@valleysecurity.in" required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '13px 14px 13px 42px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 14, color: '#fff', fontSize: 14,
                    outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••••" required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '13px 44px 13px 42px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 14, color: '#fff', fontSize: 14,
                    outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                    borderRadius: 12, fontSize: 13, color: '#f87171',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                  }}>
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(212,175,55,0.5)' : 'linear-gradient(135deg, #d4af37, #e8c547, #c49b2a)',
                color: '#000', border: 'none', borderRadius: 14,
                fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 8px 28px rgba(212,175,55,0.4)',
                fontFamily: 'inherit', transition: 'box-shadow 0.2s',
                marginTop: 4,
              }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" />Authenticating...</> : 'Sign In to Dashboard'}
            </motion.button>
          </motion.form>

          <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, textAlign: 'center', marginTop: 28 }}>
            Valley Security Service Agency © 2026
          </p>
        </div>
      </motion.div>
    </div>
  )
}
