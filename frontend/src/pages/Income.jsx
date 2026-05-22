import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Plus, Trash2, Pencil, X } from 'lucide-react'
import { format } from 'date-fns'
import api from '../api/axios'
import PageWrapper from '../components/PageWrapper'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import LottiePlayer from '../components/ui/LottiePlayer'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import { useToast } from '../context/ToastContext'

const SRC = {
  salary:      { color: '#10b981', bg: '#ecfdf5', darkBg: '#022c22', label: 'Aýlyk'      },
  scholarship: { color: '#3b82f6', bg: '#eff6ff', darkBg: '#1e3a5f', label: 'Talyp haky' },
  freelance:   { color: '#8b5cf6', bg: '#f5f3ff', darkBg: '#2e1065', label: 'Freelance'  },
  gift:        { color: '#f59e0b', bg: '#fffbeb', darkBg: '#451a03', label: 'Sowgat'     },
  family:      { color: '#f97316', bg: '#fff7ed', darkBg: '#431407', label: 'Maşgala'    },
  other:       { color: '#a1a1aa', bg: '#fafafa', darkBg: '#18181b', label: 'Beýleki'    },
}

const SRCS = Object.entries(SRC).map(([v, c]) => ({ value: v, label: c.label }))
const empty = { source: 'salary', amount: '', month: new Date().toISOString().slice(0, 10), notes: '' }

function IncomeRow({ income: e, index, onEdit, onDelete, dark }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const src    = SRC[e.source] || SRC.other

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className="group flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all duration-200 cursor-default"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: dark ? src.darkBg : src.bg }}>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: src.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{src.label}</p>
        <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mt-0.5">
          {format(new Date(e.month), 'MMMM yyyy')}
        </p>
      </div>
      <p className="text-sm font-black flex-shrink-0" style={{ color: src.color }}>
        +{Number(e.amount).toLocaleString()} <span className="text-[10px] text-zinc-400 font-semibold">TMT</span>
      </p>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(e)}
          className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-all">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(e.id)}
          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}

export default function Income() {
  const [incomes,     setIncomes]     = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [form,        setForm]        = useState(empty)
  const [editId,      setEditId]      = useState(null)
  const [showForm,    setShowForm]    = useState(false)
  const [filter,      setFilter]      = useState({ source: '' })
  const { toast } = useToast()
  const dark = document.documentElement.classList.contains('dark')

  const load = async () => {
    const params = {}
    if (filter.source) params.source = filter.source
    const r = await api.get('income/', { params })
    setIncomes(r.data.results ?? r.data)
    setDataLoading(false)
  }
  useEffect(() => { load() }, [filter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, amount: parseFloat(form.amount), month: form.month.slice(0, 7) + '-01' }
    editId ? await api.put(`income/${editId}/`, payload) : await api.post('income/', payload)
    setForm(empty); setEditId(null); setShowForm(false)
    toast.success(editId ? 'Üýtgedildi!' : 'Goşuldy!')
    load()
  }
  const handleDelete = async (id) => {
    if (!confirm('Pozmak isleýärsiňizmi?')) return
    await api.delete(`income/${id}/`)
    toast.error('Pozuldy.')
    load()
  }
  const startEdit = (e) => { setForm({ ...e, amount: String(e.amount) }); setEditId(e.id); setShowForm(true) }

  const total = incomes.reduce((s, e) => s + parseFloat(e.amount || 0), 0)
  const grouped = incomes.reduce((acc, e) => {
    const d = e.month.slice(0, 7)
    if (!acc[d]) acc[d] = []
    acc[d].push(e)
    return acc
  }, {})

  return (
    <PageWrapper>
      <div className="space-y-5">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-1">Maliýe girdeji</p>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Girdejiler</h1>
            {incomes.length > 0 && (
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                Jemi: <span className="text-emerald-500 font-black">+<AnimatedNumber value={total} /></span> TMT
              </p>
            )}
          </div>
          <Button onClick={() => { setForm(empty); setEditId(null); setShowForm(true) }} className="w-full sm:w-auto">
            <Plus size={16} strokeWidth={3} /> Goş
          </Button>
        </div>

        {/* Source filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilter({ source: '' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${!filter.source ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'}`}>
            Ählisi
          </button>
          {SRCS.map(s => {
            const cfg = SRC[s.value]
            const active = filter.source === s.value
            return (
              <button key={s.value} onClick={() => setFilter({ source: active ? '' : s.value })}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all"
                style={active ? { backgroundColor: cfg.color, borderColor: cfg.color, color: '#fff' }
                  : { borderColor: '#e4e4e7', color: '#71717a' }}>
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-zinc-900 dark:text-white text-base">{editId ? 'Düzetmek' : 'Täze girdeji'}</h3>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                    <X size={16} className="text-zinc-500" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Çeşme</label>
                    <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="input-zinc">
                      {SRCS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Möçber (TMT)</label>
                    <input required type="number" step="0.01" value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      className="input-zinc font-bold" placeholder="0.00" />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Aý</label>
                    <input required type="date" value={form.month}
                      onChange={e => setForm(f => ({ ...f, month: e.target.value }))} className="input-zinc" />
                  </div>
                  <div className="sm:col-span-2 flex gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <Button type="submit" className="flex-1">Ýatda sakla</Button>
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Ýatyr</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {dataLoading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <LottiePlayer type="loading" size={36} />
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Ýüklenýär...</p>
          </div>
        ) : incomes.length === 0 ? (
          <EmptyState title="Girdeji tapylmady" description="Ilkinji girdejini goşuň."
            action={<Button onClick={() => setShowForm(true)}><Plus size={15} /> Goş</Button>} />
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([month, items], gi) => (
              <div key={month}>
                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{month}</p>
                  <p className="text-[10px] font-black text-emerald-500">
                    +{items.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toLocaleString()} TMT
                  </p>
                </div>
                <div className="px-2 py-1.5">
                  {items.map((e, i) => (
                    <IncomeRow key={e.id} income={e} index={gi * 10 + i} onEdit={startEdit} onDelete={handleDelete} dark={dark} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
