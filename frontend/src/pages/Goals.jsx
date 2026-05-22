import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, Target, Calendar, X } from 'lucide-react'
import api from '../api/axios'
import PageWrapper from '../components/PageWrapper'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import LottiePlayer from '../components/ui/LottiePlayer'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import { GoalConfetti, useConfetti } from '../components/ui/Confetti'
import { GoalsSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import clsx from 'clsx'

// ── Circular progress ring ────────────────────────────────────────────
function Ring({ pct, size = 96, stroke = 7, color = '#3b82f6' }) {
  const r  = (size - stroke) / 2
  const c  = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" strokeWidth={stroke} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
      <motion.circle cx={size / 2} cy={size / 2} r={r}
        fill="none" strokeWidth={stroke} stroke={color} strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} />
    </svg>
  )
}

// ── Progress color based on % ─────────────────────────────────────────
function progressColor(pct) {
  if (pct >= 100) return '#10b981'
  if (pct >= 70)  return '#3b82f6'
  if (pct >= 30)  return '#f59e0b'
  return '#f43f5e'
}

function progressGradient(pct) {
  if (pct >= 100) return 'from-emerald-500/20 to-emerald-600/5'
  if (pct >= 70)  return 'from-blue-500/20 to-blue-600/5'
  if (pct >= 30)  return 'from-amber-500/20 to-amber-600/5'
  return 'from-rose-500/20 to-rose-600/5'
}

// ── Goal card ─────────────────────────────────────────────────────────
function GoalCard({ goal, index, onDelete, onAddFunds }) {
  const [amount,      setAmount]      = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const [funding,     setFunding]     = useState(false)
  const { burst } = useConfetti()
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const pct    = Math.min(goal.progress_percentage || 0, 100)
  const color  = progressColor(pct)

  const handleAdd = async () => {
    if (!amount || funding) return
    setFunding(true)
    try {
      const result = await onAddFunds(goal.id, parseFloat(amount))
      setAmount('')
      setShowSuccess(true)
      const newPct = Math.min(((parseFloat(goal.current_amount) + parseFloat(amount)) / parseFloat(goal.target_amount)) * 100, 100)
      if (newPct >= 100) { setJustCompleted(true); burst(0.5, 0.5) }
      setTimeout(() => { setShowSuccess(false); setJustCompleted(false) }, 2500)
    } finally { setFunding(false) }
  }

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-zinc-100 dark:hover:shadow-zinc-900/50 hover:-translate-y-1 transition-all duration-300">

        {/* Color gradient header */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${progressGradient(pct)} relative overflow-hidden`}>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={inView ? { scaleX: pct / 100 } : {}}
            transition={{ duration: 1.4, delay: index * 0.08 + 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="p-6">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="font-black text-zinc-900 dark:text-white text-lg tracking-tight leading-tight truncate">
                {goal.title}
              </h3>
              {goal.deadline && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Calendar size={11} className="text-zinc-400" />
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                    {goal.days_remaining > 0 ? `${goal.days_remaining} gün galdy` : 'Möhlet gutardy'}
                  </span>
                </div>
              )}
            </div>
            <button onClick={() => onDelete(goal.id)}
              className="p-2 text-zinc-300 dark:text-zinc-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 flex-shrink-0 opacity-0 group-hover:opacity-100">
              <Trash2 size={15} />
            </button>
          </div>

          {/* Progress ring + amounts */}
          <div className="flex items-center gap-5 mb-5">
            <div className="relative flex-shrink-0">
              <Ring pct={pct} color={color} size={88} stroke={6} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black text-zinc-900 dark:text-white" style={{ color }}>
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Toplanan</p>
                <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                  <AnimatedNumber value={goal.current_amount} />
                  <span className="text-xs font-semibold text-zinc-400 ml-1">TMT</span>
                </p>
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Maksat</p>
                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                  {Number(goal.target_amount).toLocaleString()} TMT
                </p>
              </div>
            </div>
          </div>

          {/* Success overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/96 dark:bg-zinc-900/96 backdrop-blur-sm z-20 rounded-3xl">
                <LottiePlayer type={justCompleted ? 'celebration' : 'success'} size={80} />
                <p className={clsx('text-xs font-black uppercase tracking-widest mt-3', justCompleted ? 'text-amber-500' : 'text-emerald-600')}>
                  {justCompleted ? 'Maksat tamamlandy! 🏆' : 'Goşuldy!'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          {!goal.is_completed ? (
            <div className="flex gap-2">
              <input type="number" step="0.01" min="0" placeholder="Möçber..."
                value={amount} onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-zinc-900 dark:focus:border-zinc-300 dark:text-white transition-all" />
              <button onClick={handleAdd} disabled={!amount || funding}
                className="px-4 py-2.5 text-sm font-black text-white rounded-xl transition-all disabled:opacity-40 active:scale-95"
                style={{ backgroundColor: color }}>
                {funding ? '...' : 'Goş'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-xl">
              <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest">Tamamlandy</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────
const empty = { title: '', target_amount: '', current_amount: '0', deadline: '' }

export default function Goals() {
  const [goals,       setGoals]       = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [form,        setForm]        = useState(empty)
  const [showForm,    setShowForm]    = useState(false)
  const { toast } = useToast()

  const load = async () => {
    const r = await api.get('goals/')
    setGoals(r.data.results ?? r.data)
    setDataLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('goals/', { ...form, target_amount: parseFloat(form.target_amount), current_amount: parseFloat(form.current_amount) })
    setForm(empty); setShowForm(false)
    toast.success('Täze maksat döredildi!')
    load()
  }
  const handleDelete = async (id) => {
    if (!confirm('Bu maksady pozmak isleýärsiňizmi?')) return
    await api.delete(`goals/${id}/`)
    toast.error('Maksat pozuldy.')
    load()
  }
  const handleAddFunds = async (id, amount) => {
    await api.post(`goals/${id}/add-funds/`, { amount })
    load()
  }

  const completed  = goals.filter(g => g.is_completed)
  const active     = goals.filter(g => !g.is_completed)

  return (
    <PageWrapper>
      <div className="space-y-6 md:space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-1">Maliýe maksatlar</p>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Maksatlar</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Plus size={16} strokeWidth={3} /> Täze maksat
          </Button>
        </div>

        {/* New goal form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-zinc-900 dark:text-white text-lg">Täze maksat</h3>
                <button onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  <X size={18} className="text-zinc-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Ady</label>
                  <input required placeholder="Meselem: Täze laptop" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="input-zinc" autoFocus />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Maksat möçber (TMT)</label>
                  <input required type="number" step="0.01" placeholder="0.00" value={form.target_amount}
                    onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
                    className="input-zinc font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Möhleti</label>
                  <input type="date" value={form.deadline}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="input-zinc" />
                </div>
                <div className="sm:col-span-2 flex gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Button type="submit" className="flex-1">Döret</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Ýatyr</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {dataLoading ? (
          <GoalsSkeleton />
        ) : goals.length === 0 ? (
          <EmptyState icon={Target} title="Heniz maksat ýok"
            description="Ilkinji ýygnama maksadyňyzy dörediň."
            action={<Button onClick={() => setShowForm(true)}><Plus size={15} /> Maksat döret</Button>} />
        ) : (
          <div className="space-y-8">
            {/* Active goals */}
            {active.length > 0 && (
              <div>
                <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
                  Işjeň — {active.length} maksat
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  <AnimatePresence>
                    {active.map((g, i) => (
                      <GoalCard key={g.id} goal={g} index={i} onDelete={handleDelete} onAddFunds={handleAddFunds} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Completed goals */}
            {completed.length > 0 && (
              <div>
                <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
                  Tamamlanan — {completed.length} maksat
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  <AnimatePresence>
                    {completed.map((g, i) => (
                      <GoalCard key={g.id} goal={g} index={i} onDelete={handleDelete} onAddFunds={handleAddFunds} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
