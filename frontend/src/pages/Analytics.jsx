import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { TrendingUp, Activity, PieChart as PieIcon } from 'lucide-react'
import api from '../api/axios'
import PageWrapper from '../components/PageWrapper'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import LottiePlayer from '../components/ui/LottiePlayer'
import useDarkMode from '../hooks/useDarkMode'

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

const CAT_LABELS = {
  food: 'Iýmit', transport: 'Ulag', education: 'Bilim',
  internet: 'Internet', leisure: 'Dynç alyş', health: 'Saglyk', other: 'Beýleki',
}

function StatPill({ label, value, color, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '20' }}>
        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div>
        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
          <AnimatedNumber value={value} /> <span className="text-xs font-semibold text-zinc-400">TMT</span>
        </p>
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, dark }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-xl text-sm ${dark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-900'}`}>
      {payload.map(p => (
        <p key={p.name} className="font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.payload.fill }} />
          {p.name || p.payload.category}: <span className="font-black ml-1">{Number(p.value).toLocaleString()} TMT</span>
        </p>
      ))}
    </div>
  )
}

function CategoryBar({ item, index, color }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">
            {CAT_LABELS[item.category] || item.category}
          </span>
        </div>
        <span className="font-black text-zinc-900 dark:text-white text-xs">
          {Number(item.total).toLocaleString()} TMT · {item.percentage}%
        </span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${item.percentage}%` } : {}}
          transition={{ duration: 1, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function Analytics() {
  const [byCategory,   setByCategory]   = useState([])
  const [balanceTrend, setBalanceTrend] = useState([])
  const [monthly,      setMonthly]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [dark] = useDarkMode()
  const gridColor = dark ? '#27272a' : '#f4f4f5'

  useEffect(() => {
    Promise.all([
      api.get('analytics/by-category/'),
      api.get('analytics/balance-trend/'),
      api.get('analytics/monthly/'),
    ]).then(([cat, trend, mon]) => {
      setByCategory(cat.data)
      setBalanceTrend(trend.data)
      setMonthly(mon.data)
      setLoading(false)
    })
  }, [])

  const totalExpenses = byCategory.reduce((s, c) => s + parseFloat(c.total || 0), 0)
  const topCategory   = byCategory[0]

  if (loading) return (
    <PageWrapper>
      <div className="flex flex-col items-center py-20 gap-4">
        <LottiePlayer type="loading" size={36} />
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Ýüklenýär...</p>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <div className="space-y-5 md:space-y-6">

        {/* Page header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-1">Maliýe analitika</p>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Analitika</h1>
          </div>
          <LottiePlayer type="trend" size={80} />
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatPill index={0} label="Jemi çykdajy" value={totalExpenses} color="#f43f5e" />
          <StatPill index={1} label="Iň köp kategoriýa" value={parseFloat(topCategory?.total || 0)} color={PALETTE[0]} />
          <StatPill index={2} label="Günlük ortaça" value={totalExpenses / 30} color="#8b5cf6" />
        </div>

        {/* Balance trend — full width */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Activity size={17} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 dark:text-white tracking-tight">Balans Trendi</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Häzirki aý</p>
            </div>
          </div>
          <div className="h-[220px] md:h-[260px]">
            {balanceTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center"><LottiePlayer type="empty" size={80} /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceTrend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a1a1aa' }}
                    tickFormatter={d => d.slice(8)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip dark={dark} />} />
                  <Area type="monotone" dataKey="balance" name="Balans" stroke="#3b82f6" strokeWidth={2.5}
                    fill="url(#balGrad)" dot={false} activeDot={{ r: 5, fill: '#3b82f6' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Category breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pie chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <PieIcon size={17} className="text-violet-600" />
              </div>
              <div>
                <h3 className="font-black text-zinc-900 dark:text-white tracking-tight">Kategoriýalar</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{byCategory.length} kategoriýa</p>
              </div>
            </div>
            <div className="h-[220px]">
              {byCategory.length === 0 ? (
                <div className="h-full flex items-center justify-center"><LottiePlayer type="empty" size={80} /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="total" nameKey="category"
                      cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                      paddingAngle={3}>
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div className={`rounded-2xl border px-4 py-3 shadow-xl text-sm ${dark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100'}`}>
                          <p className="font-bold">{CAT_LABELS[d.category] || d.category}</p>
                          <p className="font-black text-lg">{Number(d.total).toLocaleString()} TMT</p>
                          <p className="text-xs text-zinc-400">{d.percentage}%</p>
                        </div>
                      )
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Progress bars */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <TrendingUp size={17} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-black text-zinc-900 dark:text-white tracking-tight">Paýlanma</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Göterim boýunça</p>
              </div>
            </div>
            <div className="space-y-4">
              {byCategory.map((item, i) => (
                <CategoryBar key={item.category} item={item} index={i} color={PALETTE[i % PALETTE.length]} />
              ))}
              {byCategory.length === 0 && (
                <div className="flex flex-col items-center py-8">
                  <LottiePlayer type="empty" size={80} />
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">Maglumat ýok</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </PageWrapper>
  )
}
