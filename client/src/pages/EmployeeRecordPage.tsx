import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Printer, ChevronDown, Loader2, Search, FileText, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import axios from 'axios'

interface Employee {
  id: string
  name: string
  fatherName: string
  dob: string
  gender: string
  bloodGroup: string
  mobile: string
  email: string
  permanentAddress: string
  currentAddress: string
  designation: string
  department: string
  clientLocation: string
  joiningDate: string
  status: string
  category: string
  documents: {
    photo: string
    signature: string
    aadhaar: string
    pan: string
    policeVerification: string
  }
}

export default function EmployeeRecordPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selected, setSelected] = useState<Employee | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/employees')
      .then(res => {
        const emps = res.data?.employees || res.data || []
        setEmployees(emps)
        if (emps.length > 0) setSelected(emps[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = employees.filter(emp => {
    const q = search.toLowerCase()
    return !q ||
      (emp.name || '').toLowerCase().includes(q) ||
      (emp.id || '').toLowerCase().includes(q) ||
      (emp.designation || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="print:hidden">
        <h2 className={cn('text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-black')}>
          Employee Records
        </h2>
        <p className={cn('text-sm mt-0.5', isDark ? 'text-white/40' : 'text-black/40')}>
          View and print official employee profile record sheets on company letterhead
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20 print:hidden">
          <Loader2 className="animate-spin text-amber-400" size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6 items-start">
          {/* Left panel: selection list */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn('p-4 rounded-2xl border flex flex-col gap-4 print:hidden', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
          >
            {/* Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase">Search Guard</label>
              <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border', isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5')}>
                <Search size={14} className="text-gray-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="flex-1 bg-transparent text-xs outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase">Choose Profile</label>
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                {filtered.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => setSelected(emp)}
                    className={cn(
                      'w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer',
                      selected?.id === emp.id
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-black/5 text-gray-600'
                    )}
                  >
                    <p className="font-bold truncate">{emp.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{emp.id} · {emp.designation}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-black cursor-pointer transition-all"
              style={{ background: 'linear-gradient(135deg, #d4af37, #e8c547)', boxShadow: '0 4px 14px rgba(212,175,55,0.2)' }}
            >
              <Printer size={15} />
              Print Record Sheet
            </button>
          </motion.div>

          {/* Right panel: Letterhead Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className={cn('rounded-2xl border shadow-xl overflow-hidden', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-white')}
          >
            {/* Printable Container */}
            <div className="bg-white text-black p-8 md:p-12 font-sans min-h-[842px] max-w-[800px] mx-auto flex flex-col justify-between border border-gray-100 shadow-inner">
              {/* Header Letterhead */}
              <div className="flex items-center justify-between border-b-2 border-amber-500 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow">
                    <Shield size={26} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-[16px] font-black tracking-wide text-gray-800 leading-none">
                      VALLEY SECURITY SERVICE AGENCY
                    </h1>
                    <p className="text-[9px] text-gray-500 tracking-wider font-semibold mt-1">
                      SHAHEED GUNJ NATH COMPLEX SRINAGAR 190001
                    </p>
                  </div>
                </div>
                <div className="text-right text-[8px] text-gray-500 leading-relaxed font-mono">
                  <p>PHONE: 7889311608</p>
                  <p>EMAIL: VLLSCRTSERVICE@GMAIL.COM</p>
                  <p>PSARA: PSA|L|99|JK|2024|DEC|3|62</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-6 shrink-0">
                <h2 className="text-sm font-black tracking-[3px] text-gray-700 border border-gray-200 inline-block px-5 py-1 rounded bg-gray-50">
                  EMPLOYEE RECORD FORM
                </h2>
                <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest font-bold">For Official Records</p>
              </div>

              {/* Main Content Area */}
              {selected ? (
                <div className="flex-1 flex flex-col gap-6">
                  {/* Photo & Personal details */}
                  <div className="grid grid-cols-[110px_1fr] gap-6 items-start">
                    {/* Photo box */}
                    <div className="w-[110px] h-[135px] border border-gray-300 rounded overflow-hidden flex items-center justify-center bg-gray-50 shrink-0">
                      {selected.documents?.photo ? (
                        <img src={selected.documents.photo} alt={selected.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">PHOTO</span>
                      )}
                    </div>

                    {/* Basic details */}
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-bold text-gray-500 w-[120px]">Employee ID:</td>
                          <td className="py-2 font-bold text-gray-800">{selected.id}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-bold text-gray-500">Full Name:</td>
                          <td className="py-2 text-gray-800">{selected.name}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-bold text-gray-500">Father's Name:</td>
                          <td className="py-2 text-gray-800">{selected.fatherName}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-bold text-gray-500">Date of Birth:</td>
                          <td className="py-2 text-gray-800">{selected.dob}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-bold text-gray-500">Gender:</td>
                          <td className="py-2 text-gray-800">{selected.gender}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-bold text-gray-500">Blood Group:</td>
                          <td className="py-2 text-gray-800 font-bold text-red-500">{selected.bloodGroup || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Employment Details */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-gray-700 border-b border-gray-200 pb-1 tracking-wider uppercase">
                      1. Employment & Deployment Info
                    </h3>
                    <table className="w-full text-xs border-collapse">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-1.5 font-bold text-gray-500 w-[120px]">Designation:</td>
                          <td className="py-1.5 text-gray-800">{selected.designation}</td>
                          <td className="py-1.5 font-bold text-gray-500 w-[120px]">Department:</td>
                          <td className="py-1.5 text-gray-800">{selected.department || 'N/A'}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-1.5 font-bold text-gray-500">Deployment Location:</td>
                          <td className="py-1.5 text-gray-800">{selected.clientLocation || 'Unassigned / Reserve'}</td>
                          <td className="py-1.5 font-bold text-gray-500">Joining Date:</td>
                          <td className="py-1.5 text-gray-800">{selected.joiningDate || 'N/A'}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-1.5 font-bold text-gray-500">Manager:</td>
                          <td className="py-1.5 text-gray-800">{selected.reportingManager}</td>
                          <td className="py-1.5 font-bold text-gray-500">Manpower Category:</td>
                          <td className="py-1.5 text-gray-800">{selected.category || 'N/A'}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-1.5 font-bold text-gray-500">Employment Status:</td>
                          <td className="py-1.5 text-gray-800 font-bold">{selected.status}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-gray-700 border-b border-gray-200 pb-1 tracking-wider uppercase">
                      2. Contact & Address Details
                    </h3>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-1.5 font-bold text-gray-500 w-[120px]">Mobile Number:</td>
                          <td className="py-1.5 text-gray-800">{selected.mobile}</td>
                          <td className="py-1.5 font-bold text-gray-500 w-[120px]">Email Address:</td>
                          <td className="py-1.5 text-gray-800">{selected.email || 'N/A'}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-1.5 font-bold text-gray-500">Current Residence:</td>
                          <td className="py-1.5 text-gray-800" colSpan={3}>{selected.currentAddress}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-1.5 font-bold text-gray-500">Permanent Native:</td>
                          <td className="py-1.5 text-gray-800" colSpan={3}>{selected.permanentAddress}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Document Scans */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-gray-700 border-b border-gray-200 pb-1 tracking-wider uppercase">
                      3. Verification & Compliance
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="p-2 border border-gray-200 rounded text-center">
                        <span className="text-[8px] uppercase text-gray-400 block font-bold">Aadhaar Status</span>
                        <span className="font-bold text-gray-700 mt-0.5 block">{selected.documents?.aadhaar || 'Pending'}</span>
                      </div>
                      <div className="p-2 border border-gray-200 rounded text-center">
                        <span className="text-[8px] uppercase text-gray-400 block font-bold">PAN Card Check</span>
                        <span className="font-bold text-gray-700 mt-0.5 block">{selected.documents?.pan || 'Pending'}</span>
                      </div>
                      <div className="p-2 border border-gray-200 rounded text-center">
                        <span className="text-[8px] uppercase text-gray-400 block font-bold">Police Clearance</span>
                        <span className="font-bold text-gray-700 mt-0.5 block">{selected.documents?.policeVerification || 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-400 font-bold">
                  No guard profile selected.
                </div>
              )}

              {/* Signature Footer */}
              <div className="flex justify-between items-end border-t border-dashed border-gray-200 pt-6 mt-12 shrink-0">
                <div className="text-center w-[200px]">
                  <div className="h-10 flex items-center justify-center">
                    {selected?.documents?.signature ? (
                      <img src={selected.documents.signature} alt="Sig" className="max-h-8 object-contain" />
                    ) : (
                      <span className="text-[9px] italic text-gray-400">No Signature Uploaded</span>
                    )}
                  </div>
                  <div className="border-t border-gray-400 text-[10px] text-gray-500 pt-1">
                    Employee Signature
                  </div>
                </div>

                <div className="text-center w-[200px]">
                  <div className="h-10"></div>
                  <div className="border-t border-gray-400 text-[10px] text-gray-500 pt-1">
                    Authorized Signatory
                  </div>
                </div>
              </div>

              {/* Bottom Info Note */}
              <div className="text-center mt-6 pt-3 border-t border-gray-100 text-[7.5px] text-gray-400 tracking-wider shrink-0 font-mono">
                <p>CONFIDENTIAL RECORD OF VALLEY SECURITY SERVICE AGENCY. FOR OFFICE INTERNAL USE ONLY.</p>
                <p className="mt-0.5">GENERATED DATE: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
