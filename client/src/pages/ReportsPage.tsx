import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileSpreadsheet, Play, Loader2, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import axios from 'axios'

interface Employee {
  id: string
  name: string
  designation: string
  department: string
  mobile: string
  joiningDate: string
  clientLocation: string
  status: string
}

export default function ReportsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Report Config State
  const [reportType, setReportType] = useState<'master' | 'active' | 'inactive'>('master')
  const [selectedDept, setSelectedDept] = useState<string>('')
  const [compiledData, setCompiledData] = useState<Employee[]>([])
  const [compiled, setCompiled] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [empRes, classRes] = await Promise.all([
        axios.get('/api/employees'),
        axios.get('/api/classifications').catch(() => ({ data: { departments: [] } }))
      ])
      setEmployees(empRes.data?.employees || empRes.data || [])
      setDepartments(classRes.data?.departments || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCompile = (e: React.FormEvent) => {
    e.preventDefault()
    const compiled = employees.filter(emp => {
      // Status filter
      const matchesStatus = reportType === 'master' ||
        (reportType === 'active' && emp.status === 'Active') ||
        (reportType === 'inactive' && emp.status !== 'Active')

      // Department filter
      const matchesDept = !selectedDept || emp.department === selectedDept

      return matchesStatus && matchesDept
    })
    setCompiledData(compiled)
    setCompiled(true)
  }

  const handleExportCSV = () => {
    if (compiledData.length === 0) return

    const headers = ['Guard ID', 'Name', 'Designation', 'Department', 'Mobile Phone', 'Joining Date', 'Deployment Site', 'Status']
    const csvRows = compiledData.map(emp => [
      emp.id || '',
      emp.name || '',
      emp.designation || '',
      emp.department || '',
      emp.mobile || '',
      emp.joiningDate || '',
      emp.clientLocation || 'Unassigned',
      emp.status || ''
    ])

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `VSA_Operational_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn('text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-black')}>
          Operational Reports
        </h2>
        <p className={cn('text-sm mt-0.5', isDark ? 'text-white/40' : 'text-black/40')}>
          Compile manpower lists and export official rosters
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-amber-400" size={28} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn('p-5 rounded-2xl border', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
          >
            <form onSubmit={handleCompile} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Report Type</label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value as any)}
                  className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white' : 'bg-white border-black/10 text-black')}
                >
                  <option value="master">All Personnel Master List</option>
                  <option value="active">Active Personnel</option>
                  <option value="inactive">Inactive / Suspended</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Filter Department</label>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white' : 'bg-white border-black/10 text-black')}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-black cursor-pointer transition-all h-[38px]"
                style={{ background: 'linear-gradient(135deg, #d4af37, #e8c547)', boxShadow: '0 4px 14px rgba(212,175,55,0.2)' }}
              >
                <Play size={13} />
                Compile Report
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={!compiled || compiledData.length === 0}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all h-[38px] cursor-pointer',
                  compiled && compiledData.length > 0
                    ? 'border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20'
                    : isDark ? 'border-white/5 text-white/30 bg-white/5 cursor-not-allowed' : 'border-black/5 text-black/30 bg-black/5 cursor-not-allowed'
                )}
              >
                <FileSpreadsheet size={13} />
                Export Excel CSV
              </button>
            </form>
          </motion.div>

          {/* Compiled Result Preview */}
          {compiled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('p-5 rounded-2xl border overflow-hidden flex flex-col', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <BarChart2 size={16} className="text-amber-400" />
                  Compiled Report Preview
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {compiledData.length} guards found
                </span>
              </div>

              {compiledData.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-500">No personnel match current filters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className={cn('border-b text-[10px] uppercase font-bold text-gray-500', isDark ? 'border-white/5' : 'border-black/5')}>
                        <th className="py-2.5 px-3">Guard ID</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Designation</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Mobile</th>
                        <th className="py-2.5 px-3">Joining Date</th>
                        <th className="py-2.5 px-3">Location</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compiledData.map(emp => (
                        <tr
                          key={emp.id}
                          className={cn('border-b transition-colors', isDark ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-black/5')}
                        >
                          <td className="py-2.5 px-3 font-mono font-semibold text-gray-400">{emp.id}</td>
                          <td className={cn('py-2.5 px-3 font-bold', isDark ? 'text-white' : 'text-black')}>{emp.name}</td>
                          <td className="py-2.5 px-3">{emp.designation}</td>
                          <td className="py-2.5 px-3 text-gray-400">{emp.department}</td>
                          <td className="py-2.5 px-3 text-gray-400">{emp.mobile}</td>
                          <td className="py-2.5 px-3 font-mono">{emp.joiningDate}</td>
                          <td className="py-2.5 px-3 truncate max-w-[150px]">{emp.clientLocation || 'Unassigned'}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={cn(
                                'text-[9px] px-1.5 py-0.5 rounded font-bold border',
                                emp.status === 'Active'
                                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                              )}
                            >
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
