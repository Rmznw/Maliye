import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Plus, Trash2, Pencil, X, RefreshCw, Filter, ChevronDown } from 'lucide-react'
import api from '../api/axios'
import PageWrapper from '../components/PageWrapper'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import LottiePlayer from '../components/ui/LottiePlayer'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import SMSScanner from '../components/SMSScanner'
import QRScanner from '../components/QRScanner'
import { useToast } from '../context/ToastContext'

const CAT = {
  food:      { color: '#f97316', bg: '#fff7ed', darkBg: '#431407', label: 'Iýmit'     },
  transport: { color: '#3b82f6', bg: '#eff6ff', darkBg: '#1e3a5f', label: 'Ulag'       },
  education: { color: '#8b5cf6', bg: '#f5f3ff', darkBg: '#2e1065', label: 'Bilim'      },
  internet:  { color: '#06b6d4', bg: '#ecfeff', darkBg: '#083344', label: 'Internet'   },
  leisure:   { color: '#ec4899', bg: '#fdf2f8', darkBg: '#500724', label: 'Dynç alyş'  },
  health:    { color: '#ef4444', bg: '#fef2f2', darkBg: '#450a0a', label: 'Saglyk'     },
  other:     { color: '#a1a1aa', bg: '#fafafa', darkBg: '#18181b', label: 'Beýleki'    },
}

const FREQ = { daily: 'Her gün', weekly: 'Her hepde', monthly: 'Her aý' }

const CATS = Object.entries(CAT).map(([v, c]) => ({ value: v, label: c.label }))
const empty = { title: '', amount: '', category: 'food', date: new Date().toISOString().slice(0, 10), notes: '', is_recurring: false, recurrence_frequency: '' }

function ExpenseRow({ expense: e, index, onEdit, onDelete, dark }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const cat    = CAT[e.category] || CAT.other

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className="group flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all duration-200 cursor-default"
    >
      {/* Category icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: dark ? cat.darkBg : cat.bg }}>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{e.title}</p>
          {e.is_recurring && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex-shrink-0"
              style={{ backgroundColor: dark ? '#1e3a5f' : '#eff6ff', color: '#3b82f6' }}>
              <RefreshCw size={8} strokeWidth={3} /> {FREQ[e.recurrence_frequency] || ''}
            </span>
          )}
        </div>
        <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mt-0.5">
          {e.date} · <span style={{ color: cat.color }}>{cat.label}</span>
        </p>
      </div>

      {/* Amount */}
      <p className="text-sm font-black text-zinc-900 dark:text-white flex-shrink-0">
        −{Number(e.amount).toLocaleString()} <span className="text-[10px] text-zinc-400 font-semibold">TMT</span>
      </p>

      {/* Actions */}
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

export default function Expenses() {
  const [expenses,    setExpenses]    = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [form,        setForm]        = useState(empty)
  const [editId,      setEditId]      = useState(null)
  const [showForm,    setShowForm]    = useState(false)
  const [filter,      setFilter]      = useState({ category: '', month: '' })
  const [showFilter,  setShowFilter]  = useState(false)
  const { toast } = useToast()
  const [dark] = useState(() => document.documentElement.classList.contains('dark'))

  const load = async () => {
    const params = {}
    if (filter.category) params.category = filter.category
    if (filter.month)    params.month    = filter.month
    const r = await api.get('expenses/', { params })
    setExpenses(r.data.results ?? r.data)
    setDataLoading(false)
  }
  useEffect(() => { load() }, [filter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, amount: parseFloat(form.amount), recurrence_frequency: form.is_recurring ? form.recurrence_frequency : '' }
    editId ? await api.put(`expenses/${editId}/`, payload) : await api.post('expenses/', payload)
    setForm(empty); setEditId(null); setShowForm(false)
    toast.success(editId ? 'Üýtgedildi!' : 'Goşuldy!')
    load()
  }
  const handleDelete = async (id) => {
    if (!confirm('Pozmak isleýärsiňizmi?')) return
    await api.delete(`expenses/${id}/`)
    toast.error('Pozuldy.')
    load()
  }
  const startEdit = (e) => { setForm({ ...e, amount: String(e.amount), recurrence_frequency: e.recurrence_frequency || '' }); setEditId(e.id); setShowForm(true) }

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0)
  const grouped = expenses.reduce((acc, e) => {
    const d = e.date.slice(0, 7)
    if (!acc[d]) acc[d] = []
    acc[d].push(e)
    return acc
  }, {})

  return (
    <PageWrapper>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-1">Maliýe hereketler</p>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Çykdajylar</h1>
            {expenses.length > 0 && (
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                Jemi: <span className="text-rose-500 font-black">−<AnimatedNumber value={total} /></span> TMT
              </p>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <QRScanner onParsed={(data) => { setForm({ ...empty, ...data, amount: String(data.amount) }); setEditId(null); setShowForm(true) }} />
            <SMSScanner onParsed={(data) => { setForm({ ...empty, ...data, amount: String(data.amount) }); setEditId(null); setShowForm(true) }} />
            <Button className="flex-1 sm:flex-none" onClick={() => { setForm(empty); setEditId(null); setShowForm(true) }}>
              <Plus size={16} strokeWidth={3} /> Goş
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowFilter(!showFilter)}
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all',
              showFilter || filter.category || filter.month
                ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300')}>
            <Filter size={14} /> Süzgüç
            {(filter.category || filter.month) && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </button>
          {Object.entries(CAT).map(([v, c]) => (
            <button key={v} onClick={() => setFilter(f => ({ ...f, category: f.category === v ? '' : v }))}
              className={clsx('px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                filter.category === v ? 'text-white border-transparent' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300')}
              style={filter.category === v ? { backgroundColor: c.color, borderColor: c.color } : {}}>
              {c.label}
            </button>
          ))}
          {(filter.category || filter.month) && (
            <button onClick={() => setFilter({ category: '', month: '' })}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Arassala ×
            </button>
          )}
        </div>

        {/* Month filter */}
        <AnimatePresence>
          {showFilter && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Aý:</label>
                <input type="number" placeholder="1-12" value={filter.month} min="1" max="12"
                  onChange={e => setFilter(f => ({ ...f, month: e.target.value }))}
                  className="input-zinc w-24 py-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, scale: 0.98, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-zinc-900 dark:text-white text-base">{editId ? 'Düzetmek' : 'Täze çykdajy'}</h3>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                    <X size={16} className="text-zinc-500" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Atlandyryş</label>
                    <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-zinc" placeholder="Meselem: Bereket market" autoFocus />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Möçber (TMT)</label>
                    <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-zinc font-bold" placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Kategoriýa</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-zinc">
                      {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Sene</label>
                    <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-zinc" />
                  </div>
                  {/* Recurring */}
                  <div className="sm:col-span-2">
                    <div onClick={() => setForm(f => ({ ...f, is_recurring: !f.is_recurring, recurrence_frequency: !f.is_recurring ? 'monthly' : '' }))}
                      className={clsx('flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none',
                        form.is_recurring ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300')}>
                      <div className="flex items-center gap-2.5">
                        <RefreshCw size={15} className={form.is_recurring ? 'text-blue-600' : 'text-zinc-400'} />
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Gaýtalanýan çykdajy</p>
                          <p className="text-[10px] text-zinc-400">Awtomatik dörediler</p>
                        </div>
                      </div>
                      <div className={clsx('w-10 h-5.5 rounded-full relative transition-colors', form.is_recurring ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700')} style={{ height: 22 }}>
                        <motion.div animate={{ x: form.is_recurring ? 18 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {form.is_recurring && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="sm:col-span-2 overflow-hidden space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Gaýtalanma döwri</label>
                        <div className="flex gap-2">
                          {[{ v: 'daily', l: 'Her gün' }, { v: 'weekly', l: 'Her hepde' }, { v: 'monthly', l: 'Her aý' }].map(f => (
                            <button key={f.v} type="button" onClick={() => setForm(p => ({ ...p, recurrence_frequency: f.v }))}
                              className={clsx('flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all',
                                form.recurrence_frequency === f.v ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300')}>
                              {f.l}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
        ) : expenses.length === 0 ? (
          <EmptyState title="Çykdajy tapylmady" description="Täze çykdajy goşuň ýa-da süzgüçleri üýtgediň."
            action={<Button onClick={() => setShowForm(true)}><Plus size={15} /> Goş</Button>} />
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([month, items], gi) => (
              <div key={month}>
                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{month}</p>
                  <p className="text-[10px] font-black text-rose-500">
                    −{items.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toLocaleString()} TMT
                  </p>
                </div>
                <div className="px-2 py-1.5">
                  {items.map((e, i) => (
                    <ExpenseRow key={e.id} expense={e} index={gi * 10 + i} onEdit={startEdit} onDelete={handleDelete} dark={dark} />
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

function clsx(...classes) { return classes.filter(Boolean).join(' ') }
