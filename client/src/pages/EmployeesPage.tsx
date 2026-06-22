import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Trash2, Edit2, Phone, MapPin, Loader2, X, Upload, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import axios from 'axios'

interface Employee {
  id?: string
  name: string
  fatherName: string
  dob: string
  gender: string
  bloodGroup: string
  maritalStatus: string
  mobile: string
  altMobile: string
  email: string
  permanentAddress: string
  currentAddress: string
  district: string
  state: string
  pinCode: string
  designation: string
  department: string
  clientLocation: string
  reportingManager: string
  joiningDate: string
  status: string
  category: string
  emergencyContactName: string
  emergencyContactRelation: string
  emergencyContactMobile: string
  documents: {
    photo: string
    signature: string
    aadhaar: string
    pan: string
    policeVerification: string
  }
}

const initialFormState: Employee = {
  name: '',
  fatherName: '',
  dob: '',
  gender: 'Male',
  bloodGroup: 'O+',
  maritalStatus: 'Single',
  mobile: '',
  altMobile: '',
  email: '',
  permanentAddress: '',
  currentAddress: '',
  district: '',
  state: '',
  pinCode: '',
  designation: 'Security Guard',
  department: '',
  clientLocation: 'Unassigned',
  reportingManager: 'Vikram Rathore',
  joiningDate: new Date().toISOString().split('T')[0],
  status: 'Active',
  category: 'Unskilled',
  emergencyContactName: '',
  emergencyContactRelation: '',
  emergencyContactMobile: '',
  documents: {
    photo: '',
    signature: '',
    aadhaar: 'Pending',
    pan: 'Pending',
    policeVerification: 'Pending'
  }
}

export default function EmployeesPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [formState, setFormState] = useState<Employee>(initialFormState)
  const [formTab, setFormTab] = useState<'personal' | 'address' | 'employment' | 'emergency' | 'uploads'>('personal')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Classifications & Clients state for form dropdowns
  const [departments, setDepartments] = useState<string[]>([])
  const [designations, setDesignations] = useState<string[]>([])
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [empRes, classRes, clientRes] = await Promise.all([
        axios.get('/api/employees'),
        axios.get('/api/classifications').catch(() => ({ data: { departments: [], designations: [] } })),
        axios.get('/api/clients').catch(() => ({ data: [] }))
      ])

      setEmployees(empRes.data?.employees || empRes.data || [])
      setDepartments(classRes.data?.departments || [])
      setDesignations(classRes.data?.designations || [])
      setClients(clientRes.data?.clients || clientRes.data || [])

      // Set initial form defaults if fetched
      if (classRes.data?.departments?.length > 0) {
        initialFormState.department = classRes.data.departments[0]
      }
      if (classRes.data?.designations?.length > 0) {
        initialFormState.designation = classRes.data.designations[0]
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = employees.filter(emp => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (emp.name || '').toLowerCase().includes(q) ||
      (emp.id || '').toLowerCase().includes(q) ||
      (emp.designation || '').toLowerCase().includes(q) ||
      (emp.clientLocation || '').toLowerCase().includes(q) ||
      (emp.mobile || '').includes(q)

    const matchFilter = filter === 'all' ||
      (filter === 'active' && emp.status === 'Active') ||
      (filter === 'inactive' && emp.status !== 'Active')

    return matchSearch && matchFilter
  })

  const deleteEmployee = async (id: string) => {
    if (!confirm('Delete this employee profile permanently?')) return
    try {
      await axios.delete(`/api/employees/${id}`)
      setEmployees(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      alert('Failed to delete employee profile')
    }
  }

  const openAddModal = () => {
    setFormState({
      ...initialFormState,
      department: departments[0] || '',
      designation: designations[0] || 'Security Guard'
    })
    setModalMode('add')
    setFormTab('personal')
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (emp: Employee) => {
    setFormState({ ...emp })
    setModalMode('edit')
    setFormTab('personal')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    if (id.startsWith('emergency-')) {
      const fieldName = id.replace('emergency-', '')
      const mappedKey = `emergencyContact${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}` as keyof Employee
      setFormState(prev => ({ ...prev, [mappedKey]: value }))
    } else {
      setFormState(prev => ({ ...prev, [id]: value }))
    }
  }

  const handleDocumentChange = (field: keyof Employee['documents'], value: string) => {
    setFormState(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: value
      }
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'signature') => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        handleDocumentChange(field, reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    // Validation
    if (!formState.name || !formState.fatherName || !formState.dob || !formState.mobile) {
      setFormError('Please fill in all required fields.')
      setFormTab('personal')
      setSubmitting(false)
      return
    }

    try {
      if (modalMode === 'add') {
        const res = await axios.post('/api/employees', formState)
        setEmployees(prev => [...prev, res.data])
      } else {
        const res = await axios.put(`/api/employees/${formState.id}`, formState)
        setEmployees(prev => prev.map(e => e.id === formState.id ? res.data : e))
      }
      setIsModalOpen(false)
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save employee profile.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className={cn('text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-black')}>
            Guards Directory
          </h2>
          <p className={cn('text-sm mt-0.5', isDark ? 'text-white/40' : 'text-black/40')}>
            {employees.length} total personnel registered
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #d4af37, #e8c547)', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
          onClick={openAddModal}
        >
          <Plus size={16} strokeWidth={2.5} />
          Register Guard
        </motion.button>
      </motion.div>

      {/* Search & Filter bar */}
      <div className="flex gap-3">
        <div
          className={cn(
            'flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-colors',
            isDark ? 'border-white/10 bg-white/[0.03] focus-within:border-amber-500/40' : 'border-black/10 bg-black/[0.02] focus-within:border-amber-500/40'
          )}
        >
          <Search size={15} className={isDark ? 'text-white/30' : 'text-black/30'} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, designation, location..."
            className={cn('flex-1 bg-transparent text-sm outline-none', isDark ? 'text-white placeholder-white/20' : 'text-black placeholder-black/20')}
          />
          {search && (
            <button onClick={() => setSearch('')} className="cursor-pointer">
              <X size={14} className={isDark ? 'text-white/30' : 'text-black/30'} />
            </button>
          )}
        </div>
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer',
              filter === f
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : isDark ? 'bg-white/5 text-white/40 border border-white/8 hover:bg-white/8' : 'bg-black/5 text-black/40 border border-black/8 hover:bg-black/8'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Employee grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-amber-400" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={cn('text-center py-20 text-sm', isDark ? 'text-white/30' : 'text-black/30')}>
          {search ? 'No employees match your search.' : 'No employees registered yet.'}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((emp, i) => (
              <motion.div
                key={emp.id || i}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02, type: 'spring', stiffness: 300, damping: 28 }}
                whileHover={{ y: -2 }}
                className={cn(
                  'relative p-4 rounded-2xl border transition-all group',
                  isDark ? 'border-white/8 bg-white/[0.03] hover:bg-white/[0.05]' : 'border-black/8 bg-white hover:shadow-md'
                )}
              >
                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(emp)}
                    className={cn('p-1.5 rounded-lg transition-colors cursor-pointer', isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black')}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => deleteEmployee(emp.id!)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Employee info */}
                <div className="flex items-start gap-3">
                  {emp.documents?.photo ? (
                    <img
                      src={emp.documents.photo}
                      alt={emp.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                      style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37' }}
                    >
                      {(emp.name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-semibold text-sm truncate', isDark ? 'text-white' : 'text-black')}>
                      {emp.name}
                    </p>
                    <p className={cn('text-xs truncate mt-0.5', isDark ? 'text-white/50' : 'text-black/50')}>
                      {emp.id} · {emp.designation}
                    </p>
                  </div>
                </div>

                <div className={cn('mt-3 pt-3 border-t space-y-1.5', isDark ? 'border-white/5' : 'border-black/5')}>
                  {emp.mobile && (
                    <div className="flex items-center gap-2">
                      <Phone size={12} className={isDark ? 'text-white/30' : 'text-black/30'} />
                      <span className={cn('text-xs', isDark ? 'text-white/50' : 'text-black/50')}>{emp.mobile}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className={isDark ? 'text-white/30' : 'text-black/30'} />
                    <span className={cn('text-xs truncate', isDark ? 'text-white/50' : 'text-black/50')}>
                      {emp.clientLocation || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Blood group & status badge */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                  {emp.bloodGroup && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-lg font-bold"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      {emp.bloodGroup}
                    </span>
                  )}
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-lg font-bold border',
                      emp.status === 'Active'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : emp.status === 'Suspended'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    )}
                  >
                    {emp.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Register/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={cn(
                'relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border shadow-2xl flex flex-col',
                isDark ? 'border-white/10 bg-[#0d0d11]/95 text-white' : 'border-black/10 bg-white text-black'
              )}
            >
              {/* Modal Header */}
              <div className={cn('p-5 border-b flex items-center justify-between', isDark ? 'border-white/5' : 'border-black/5')}>
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Shield className="text-amber-500" size={20} />
                    {modalMode === 'add' ? 'Register New Guard Profile' : `Edit Profile: ${formState.id}`}
                  </h3>
                  <p className={cn('text-xs mt-0.5', isDark ? 'text-white/40' : 'text-black/40')}>
                    Valley Security Service Agency — Official Personnel Enrollment
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={cn('p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer', isDark ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black')}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Navigation Tabs */}
              <div className={cn('flex border-b overflow-x-auto shrink-0', isDark ? 'border-white/5' : 'border-black/5')}>
                {(['personal', 'address', 'employment', 'emergency', 'uploads'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFormTab(tab)}
                    className={cn(
                      'px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap',
                      formTab === tab
                        ? 'border-amber-500 text-amber-500'
                        : 'border-transparent text-gray-500 hover:text-gray-400'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Modal Content / Scroll Container */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {formError && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                    <AlertCircle size={15} />
                    {formError}
                  </div>
                )}

                {/* 1. PERSONAL TAB */}
                {formTab === 'personal' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Full Name *</label>
                        <input
                          id="name"
                          required
                          value={formState.name}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Father's Name *</label>
                        <input
                          id="fatherName"
                          required
                          value={formState.fatherName}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Date of Birth *</label>
                        <input
                          id="dob"
                          type="date"
                          required
                          value={formState.dob}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Gender *</label>
                        <select
                          id="gender"
                          value={formState.gender}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Blood Group *</label>
                        <select
                          id="bloodGroup"
                          value={formState.bloodGroup}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                        >
                          {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Marital Status *</label>
                        <select
                          id="maritalStatus"
                          value={formState.maritalStatus}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Mobile Number *</label>
                        <input
                          id="mobile"
                          required
                          placeholder="10 digit phone number"
                          value={formState.mobile}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Alternate Number</label>
                        <input
                          id="altMobile"
                          placeholder="Optional"
                          value={formState.altMobile}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          placeholder="Optional"
                          value={formState.email}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ADDRESS TAB */}
                {formTab === 'address' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase">Current Residence Address *</label>
                      <input
                        id="currentAddress"
                        required
                        value={formState.currentAddress}
                        onChange={handleInputChange}
                        className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase">Permanent Native Address *</label>
                      <input
                        id="permanentAddress"
                        required
                        value={formState.permanentAddress}
                        onChange={handleInputChange}
                        className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">District *</label>
                        <input
                          id="district"
                          required
                          value={formState.district}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">State *</label>
                        <input
                          id="state"
                          required
                          value={formState.state}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">PIN Code *</label>
                        <input
                          id="pinCode"
                          required
                          placeholder="6 digits"
                          value={formState.pinCode}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. EMPLOYMENT TAB */}
                {formTab === 'employment' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Designation *</label>
                        <select
                          id="designation"
                          value={formState.designation}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                        >
                          {designations.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Department *</label>
                        <select
                          id="department"
                          value={formState.department}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                        >
                          {departments.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Deployment Site / Client *</label>
                        <select
                          id="clientLocation"
                          value={formState.clientLocation}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                        >
                          <option value="Unassigned">Unassigned / Reserve Force</option>
                          {clients.map(c => (
                            <option key={c.id || c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Reporting Officer / Manager *</label>
                        <input
                          id="reportingManager"
                          required
                          value={formState.reportingManager}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Joining Date *</label>
                        <input
                          id="joiningDate"
                          type="date"
                          required
                          value={formState.joiningDate}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Manpower Category *</label>
                        <select
                          id="category"
                          value={formState.category}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                        >
                          <option value="Unskilled">Unskilled</option>
                          <option value="Semi-Skilled">Semi-Skilled</option>
                          <option value="Skilled">Skilled</option>
                          <option value="Highly Skilled">Highly Skilled</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Employment Status *</label>
                        <select
                          id="status"
                          value={formState.status}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. EMERGENCY CONTACT TAB */}
                {formTab === 'emergency' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Contact Name *</label>
                        <input
                          id="emergency-name"
                          required
                          value={formState.emergencyContactName}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Relationship *</label>
                        <input
                          id="emergency-relation"
                          required
                          placeholder="e.g. Father, Spouse"
                          value={formState.emergencyContactRelation}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Emergency Mobile *</label>
                        <input
                          id="emergency-mobile"
                          required
                          value={formState.emergencyContactMobile}
                          onChange={handleInputChange}
                          className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none', isDark ? 'bg-white/5 border-white/10 text-white focus:border-amber-500/50' : 'bg-black/5 border-black/10 text-black focus:border-amber-500/50')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. UPLOADS & VERIFICATION TAB */}
                {formTab === 'uploads' && (
                  <div className="space-y-6">
                    {/* Image uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Passport size Photo *</label>
                        <div className="flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-white/10 bg-white/5 text-center relative overflow-hidden group">
                          {formState.documents.photo ? (
                            <>
                              <img src={formState.documents.photo} alt="Upload preview" className="max-h-36 rounded-lg object-cover" />
                              <button
                                type="button"
                                onClick={() => handleDocumentChange('photo', '')}
                                className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                              <Upload className="text-amber-500" size={24} />
                              <span className="text-xs text-white/55">Upload Profile Picture</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleFileUpload(e, 'photo')}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Signature Scan</label>
                        <div className="flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-white/10 bg-white/5 text-center relative overflow-hidden group">
                          {formState.documents.signature ? (
                            <>
                              <img src={formState.documents.signature} alt="Upload preview" className="max-h-36 rounded-lg object-contain bg-white p-2" />
                              <button
                                type="button"
                                onClick={() => handleDocumentChange('signature', '')}
                                className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                              <Upload className="text-amber-500" size={24} />
                              <span className="text-xs text-white/55">Upload Signature Scan</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleFileUpload(e, 'signature')}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Document Verification Checks */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase block border-b border-white/5 pb-1">Document Verification Checks</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase">Aadhaar Status</label>
                          <select
                            value={formState.documents.aadhaar}
                            onChange={e => handleDocumentChange('aadhaar', e.target.value)}
                            className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase">PAN Status</label>
                          <select
                            value={formState.documents.pan}
                            onChange={e => handleDocumentChange('pan', e.target.value)}
                            className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase">Police Verification</label>
                          <select
                            value={formState.documents.policeVerification}
                            onChange={e => handleDocumentChange('policeVerification', e.target.value)}
                            className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer', isDark ? 'bg-[#0f0f13] border-white/10 text-white focus:border-amber-500/50' : 'bg-white border-black/10 text-black focus:border-amber-500/50')}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>

              {/* Modal Footer */}
              <div className={cn('p-5 border-t flex items-center justify-end gap-3 shrink-0', isDark ? 'border-white/5' : 'border-black/5')}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={cn('px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer', isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-black cursor-pointer transition-all"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #e8c547)', boxShadow: '0 4px 14px rgba(212,175,55,0.2)' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={13} />
                      Save Guard Profile
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
