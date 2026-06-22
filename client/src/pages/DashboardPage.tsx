import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, Building2, MapPin } from 'lucide-react'
import axios from 'axios'

const GOLD = '#d4af37'
const CARD_BG = 'rgba(255,255,255,0.05)'
const CARD_BORDER = '1px solid rgba(255,255,255,0.1)'
const SHADOW = '0 4px 24px rgba(0,0,0,0.5)'

function StatCard({ label, value, icon: Icon, accent, sub }: {
  label: string; value: number | string; icon: any; accent?: boolean; sub?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        background: accent
          ? 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))'
          : CARD_BG,
        border: accent ? `1px solid rgba(212,175,55,0.3)` : CARD_BORDER,
        borderRadius: 20,
        padding: '24px 20px',
        boxShadow: accent ? `0 4px 32px rgba(212,175,55,0.15), ${SHADOW}` : SHADOW,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 2, background: `linear-gradient(90deg, ${GOLD}, transparent)`,
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            {label}
          </p>
          <p style={{ color: '#fff', fontSize: 42, fontWeight: 800, lineHeight: 1, letterSpacing: '-2px' }}>
            {value}
          </p>
          {sub && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8 }}>{sub}</p>
          )}
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: accent ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.07)',
          border: accent ? '1px solid rgba(212,175,55,0.2)' : '1px solid rgba(255,255,255,0.08)',
        }}>
          <Icon size={22} color={accent ? GOLD : 'rgba(255,255,255,0.5)'} strokeWidth={1.8} />
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/employees').then(r => r.data?.employees || r.data || []).catch(() => []),
      axios.get('/api/clients').then(r => r.data?.clients || r.data || []).catch(() => []),
    ]).then(([emps, cls]) => {
      setEmployees(emps)
      setClients(cls)
      setLoading(false)
    })
  }, [])

  const deployed = employees.filter((e: any) => e.clientLocation && e.clientLocation !== 'Unassigned' && e.clientLocation !== '').length
  const recent = [...employees].reverse().slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
          Dashboard Overview
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 6 }}>
          Valley Security Service Agency — Admin Panel
        </p>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Total Guards" value={employees.length} icon={Users} accent sub="registered" />
        <StatCard label="Active" value={employees.filter((e: any) => e.status === 'Active').length} icon={UserCheck} sub="on duty" />
        <StatCard label="Client Sites" value={clients.length} icon={Building2} sub="locations" />
        <StatCard label="Deployed" value={deployed} icon={MapPin} sub="on assignment" />
      </div>

      {/* Recent registrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: CARD_BG,
          border: CARD_BORDER,
          borderRadius: 20,
          padding: '24px',
          boxShadow: SHADOW,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>Recent Registrations</h3>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Latest 5</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
        ) : recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            No employees registered yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recent.map((emp: any, i: number) => (
              <motion.div
                key={emp.id || i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', borderRadius: 14,
                  cursor: 'default',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: GOLD, fontWeight: 800, fontSize: 16, flexShrink: 0,
                }}>
                  {(emp.name || emp.fullName || 'G')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {emp.name || emp.fullName || 'Unknown'}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {emp.designation || 'Security Guard'} · {emp.clientLocation || 'Unassigned'}
                  </p>
                </div>
                <span style={{
                  background: 'rgba(34,197,94,0.12)',
                  color: '#4ade80',
                  border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>Active</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
