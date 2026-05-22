import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Target, AlertTriangle, Zap,
  ArrowRight, Sparkles, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import api from '../api/axios'
import PageWrapper from '../components/PageWrapper'
import LottiePlayer, { MeshBackground } from '../components/ui/LottiePlayer'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import Sparkline from '../components/ui/Sparkline'
import { DashboardSkeleton } from '../components/ui/Skeleton'
import useAuthStore from '../store/authStore'
import useDarkMode from '../hooks/useDarkMode'
import Button from '../components/ui/Button'

// ── Category config ───────────────────────────────────────────────────
const CAT = {
  food:      { color: '#f97316', label: 'Iýmit'     },
  transport: { color: '#3b82f6', label: 'Ulag'       },
  education: { color: '#8b5cf6', label: 'Bilim'      },
  internet:  { color: '#06b6d4', label: 'Internet'   },
  leisure:   { color: '#ec4899', label: 'Dynç alyş'  },
  health:    { color: '#ef4444', label: 'Saglyk'     },
  other:     { color: '#a1a1aa', label: 'Beýleki'    },
}

function StatCard({ title, value, icon: Icon, color, colorBg, spark, currency, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-lg hover:shadow-zinc-100 dark:hover:shadow-zinc-900 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorBg}`}>
          <Icon size={18} className={color} strokeWidth={2.5} />
        </div>
        <Sparkline data={spark} color={color.replace('text-', '#').includes('#') ? color : undefined}
          width={72} height={32} fill />
      </div>
      <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
        <AnimatedNumber value={value} /> <span className="text-xs font-semibold text-zinc-400">{currency}</span>
      </p>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-2xl text-sm ${dark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-900'}`}>
      <p className="font-bold mb-2 text-zinc-400 text-xs uppercase tracking-widest">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-black">{Number(p.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState({ total_income: 0, total_expenses: 0, net_balance: 0, budget_remaining: 0, monthly_budget: 0, month: '', currency: 'TMT' })
  const [monthly, setMonthly] = useState([])
  const [recentExpenses, setRecentExpenses] = useState([])
  const [aiSummary, setAiSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryQuota, setSummaryQuota] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [dark] = useDarkMode()
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const dash = await api.get('analytics/dashboard/')
        if (mounted) setDashboard(dash.data)
        const [monthRes, expRes] = await Promise.allSettled([
          api.get('analytics/monthly/'),
          api.get('expenses/?ordering=-date'),
        ])
        if (!mounted) return
        if (monthRes.status === 'fulfilled') setMonthly(monthRes.value.data)
        if (expRes.status === 'fulfilled') setRecentExpenses((expRes.value.data.results ?? expRes.value.data).slice(0, 6))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    api.get('analytics/monthly-summary/')
      .then(r => { setAiSummary(r.data.summary); if (r.data.quota_exceeded) setSummaryQuota(true); setSummaryLoading(false) })
      .catch(() => setSummaryLoading(false))
    return () => { mounted = false }
  }, [])

  const incomeData  = monthly.map(m => parseFloat(m.income)   || 0)
  const expenseData = monthly.map(m => parseFloat(m.expenses)  || 0)

  const budgetPct  = dashboard.monthly_budget ? Math.min((Number(dashboard.total_expenses) / Number(dashboard.monthly_budget)) * 100, 100) : 0
  const budgetDanger  = budgetPct >= 90
  const budgetWarning = budgetPct >= 70 && !budgetDanger

  const gridColor = dark ? '#27272a' : '#f4f4f5'

  if (loading) return (
    <PageWrapper>
      <DashboardSkeleton />
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <div className="space-y-5 md:space-y-6">

        {/* ── Hero balance card ───────────────────────────────── */}
        <motion.div ref={heroRef}
          initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-zinc-950 rounded-3xl overflow-hidden"
        >
          {/* Animated background */}
          <MeshBackground />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-emerald-500/10 pointer-events-none" />

          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-3">{dashboard.month} • Net Balans</p>
              <div className="flex items-baseline gap-3 mb-4">
                <AnimatedNumber value={dashboard.net_balance}
                  className="text-4xl md:text-6xl font-black text-white tracking-tight" />
                <span className="text-base font-bold text-zinc-500">{dashboard.currency}</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                  <ArrowUpRight size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold">
                    <AnimatedNumber value={dashboard.total_income} suffix={` ${dashboard.currency}`} />
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-1.5">
                  <ArrowDownRight size={14} className="text-rose-400" />
                  <span className="text-rose-400 text-xs font-bold">
                    <AnimatedNumber value={dashboard.total_expenses} suffix={` ${dashboard.currency}`} />
                  </span>
                </div>
              </div>
            </div>

            {/* Mini sparkline */}
            {monthly.length > 1 && (
              <div className="flex-shrink-0">
                <Sparkline
                  data={monthly.map(m => parseFloat(m.net) || 0)}
                  color="#60a5fa" width={160} height={56} fill
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Budget alert ────────────────────────────────────── */}
        {dashboard.monthly_budget > 0 && (budgetDanger || budgetWarning) && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className={clsx('flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-semibold',
              budgetDanger
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
            )}>
            <motion.div animate={{ rotate: budgetDanger ? [0, -8, 8, 0] : 0 }}
              transition={{ repeat: budgetDanger ? Infinity : 0, duration: 0.5, repeatDelay: 2 }}>
              <AlertTriangle size={18} strokeWidth={2.5} />
            </motion.div>
            <span className="flex-1">
              {budgetDanger
                ? `Býujetiňiziň ${budgetPct.toFixed(0)}%-i ulanyldı — üns beriň!`
                : `Býujetiňiziň ${budgetPct.toFixed(0)}%-i ulanyldı.`}
            </span>
            <Zap size={15} />
          </motion.div>
        )}

        {/* ── Stat cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard index={0} title="Girdejiler"
            value={Number(dashboard.total_income || 0)}
            icon={TrendingUp} color="text-emerald-600" colorBg="bg-emerald-50 dark:bg-emerald-900/30"
            spark={incomeData} currency={dashboard.currency} />
          <StatCard index={1} title="Çykdajylar"
            value={Number(dashboard.total_expenses || 0)}
            icon={TrendingDown} color="text-rose-600" colorBg="bg-rose-50 dark:bg-rose-900/30"
            spark={expenseData} currency={dashboard.currency} />
          <StatCard index={2} title="Garaşylýan"
            value={Number(dashboard.budget_remaining || 0)}
            icon={Target} color="text-blue-600" colorBg="bg-blue-50 dark:bg-blue-900/30"
            spark={monthly.map(m => parseFloat(m.net) || 0)} currency={dashboard.currency} />
        </div>

        {/* ── Budget progress ──────────────────────────────────── */}
        {dashboard.monthly_budget > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Aýlyk Býujet</p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {Number(dashboard.total_expenses).toLocaleString()} / {Number(dashboard.monthly_budget).toLocaleString()} {dashboard.currency}
                </span>
                <span className={clsx('text-xs font-black px-2 py-0.5 rounded-lg',
                  budgetDanger ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  budgetWarning ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400')}>
                  {budgetPct.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetPct}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                className={clsx('h-full rounded-full',
                  budgetDanger ? 'bg-red-500' : budgetWarning ? 'bg-amber-400' : 'bg-emerald-500')}
              />
            </div>
          </motion.div>
        )}

        {/* ── AI Summary ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-zinc-950 p-5">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={15} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">AI Aýlyk Jemi</p>
              {summaryLoading ? (
                <div className="flex items-center gap-2"><LottiePlayer type="loading" size={16} color="#52525b" /><span className="text-xs text-zinc-600">Analizlenýär...</span></div>
              ) : summaryQuota ? (
                <p className="text-xs text-zinc-600">Günlük çäk doldy. Ertir täzelenýär.</p>
              ) : aiSummary ? (
                <p className="text-sm font-medium text-zinc-300 leading-relaxed">{aiSummary}</p>
              ) : (
                <p className="text-xs text-zinc-600">Maglumat ýok.</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Chart + Recent ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-zinc-900 dark:text-white text-lg tracking-tight">Maliýe Akymy</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">Soňky 6 aý</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500" />Girdeji</span>
                <span className="flex items-center gap-1.5 text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-500" />Çykdajy</span>
              </div>
            </div>
            <div className="h-[220px] md:h-[260px]">
              {monthly.length === 0 ? (
                <div className="h-full flex items-center justify-center"><LottiePlayer type="empty" size={80} /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip dark={dark} />} />
                    <Area type="monotone" dataKey="income" name="Girdeji" stroke="#10b981" strokeWidth={2.5} fill="url(#gInc)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
                    <Area type="monotone" dataKey="expenses" name="Çykdajy" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gExp)" dot={false} activeDot={{ r: 4, fill: '#f43f5e' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Recent transactions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-zinc-900 dark:text-white text-base tracking-tight">Soňky hereketler</h3>
              <button onClick={() => navigate('/expenses')}
                className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-500 flex items-center gap-1 transition-colors">
                Hemmesi <ArrowRight size={11} strokeWidth={3} />
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <LottiePlayer type="empty" size={64} />
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium text-center">Çykdajy ýok</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentExpenses.map((e, i) => {
                  const cat = CAT[e.category] || CAT.other
                  return (
                    <motion.div key={e.id}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group cursor-default"
                    >
                      <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: cat.color + '20' }}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate leading-tight">{e.title}</p>
                        <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">{e.date}</p>
                      </div>
                      <p className="text-sm font-black text-rose-500 flex-shrink-0">
                        −{Number(e.amount).toLocaleString()}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {!user?.monthly_budget && (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-2">Býujet bellemedik</p>
                <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate('/profile')}>
                  Býujet belläň
                </Button>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </PageWrapper>
  )
}
