import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Receipt, TrendingUp, Activity, Target, User,
  Plus, Sun, Moon, LogOut, ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import useDarkMode from '../hooks/useDarkMode'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Syn'     },
  { to: '/expenses',  icon: Receipt,         label: 'Çykdajy' },
  { to: '/income',    icon: TrendingUp,      label: 'Girdeji' },
  { to: '/analytics', icon: Activity,        label: 'Analiz'  },
  { to: '/goals',     icon: Target,          label: 'Maksat'  },
  { to: '/profile',   icon: User,            label: 'Profil'  },
]

function UserMenu({ user, dark, setDark }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 pl-3 pr-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all">
        <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 hidden sm:block max-w-[80px] truncate">{user?.username}</span>
        <motion.div whileHover={{ scale: 1.05 }}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-white uppercase text-xs shadow-md">
          {user?.username?.[0]}
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-900 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Hasap</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user?.username}</p>
            </div>
            <button onClick={() => { setDark(!dark); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-violet-500" />}
              {dark ? 'Ýagty tema' : 'Garaňky tema'}
            </button>
            <div className="border-t border-zinc-100 dark:border-zinc-800" />
            <button onClick={() => { logout(); navigate('/auth'); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut size={16} /> Çykmak
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [dark, setDark] = useDarkMode()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white flex flex-col">

      {/* ── Header ── */}
      <header className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-6',
        scrolled
          ? 'py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 shadow-sm'
          : 'py-4 bg-transparent'
      )}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/30">
              <div className="w-3 h-3 rounded-sm bg-white" />
            </div>
            <span className="font-black text-base tracking-tight text-zinc-900 dark:text-white hidden sm:block">Talyp Maliýe</span>
          </motion.div>
          <UserMenu user={user} dark={dark} setDark={setDark} />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 w-full pt-20 md:pt-24 px-3 md:px-6"
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      {/* ── Bottom nav — native style ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800">
          <div className="max-w-lg mx-auto px-2 flex items-center justify-around py-1.5">
            {navItems.slice(0, 3).map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all active:scale-90"
                  style={{ color: active ? '#3b82f6' : undefined }}>
                  <motion.div animate={active ? { scale: 1.1 } : { scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Icon size={22} className={active ? 'text-blue-600 dark:text-blue-500' : 'text-zinc-400 dark:text-zinc-600'} strokeWidth={active ? 2.5 : 2} />
                  </motion.div>
                  <span className={clsx('text-[9px] font-bold tracking-wide transition-colors',
                    active ? 'text-blue-600 dark:text-blue-500' : 'text-zinc-400 dark:text-zinc-600')}>
                    {label}
                  </span>
                  {active && (
                    <motion.div layoutId="nav-dot"
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-500"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  )}
                </Link>
              )
            })}

            {/* Center plus */}
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => navigate('/expenses')}
              className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 mb-2 flex-shrink-0"
            >
              <motion.div animate={{ rotate: [0, 0] }} whileTap={{ rotate: 45 }} transition={{ duration: 0.15 }}>
                <Plus size={22} strokeWidth={2.5} />
              </motion.div>
            </motion.button>

            {navItems.slice(3).map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all active:scale-90 relative">
                  <motion.div animate={active ? { scale: 1.1 } : { scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Icon size={22} className={active ? 'text-blue-600 dark:text-blue-500' : 'text-zinc-400 dark:text-zinc-600'} strokeWidth={active ? 2.5 : 2} />
                  </motion.div>
                  <span className={clsx('text-[9px] font-bold tracking-wide transition-colors',
                    active ? 'text-blue-600 dark:text-blue-500' : 'text-zinc-400 dark:text-zinc-600')}>
                    {label}
                  </span>
                  {active && (
                    <motion.div layoutId="nav-dot"
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-500"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
