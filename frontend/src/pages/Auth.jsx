import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, TrendingUp, Target, Sparkles, CheckCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'

// ── Floating glass cards shown on the left panel ──────────────────────
const FLOAT_CARDS = [
  {
    id: 'balance',
    style: { top: '18%', left: '6%', rotate: '-3deg' },
    float: { y: [-10, 6, -10], rotate: ['-3deg', '-1deg', '-3deg'] },
    delay: 0,
    content: (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest">
          <TrendingUp size={12} /> Aýlyk balans
        </div>
        <p className="text-white text-2xl font-black tracking-tight">+4,280 <span className="text-base font-semibold text-white/60">TMT</span></p>
        <div className="flex gap-1 mt-2">
          {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
            <motion.div key={i} className="w-1.5 rounded-full bg-emerald-400/70"
              initial={{ height: 0 }} animate={{ height: h * 0.4 }}
              transition={{ delay: 0.5 + i * 0.07, duration: 0.5, ease: 'easeOut' }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'goal',
    style: { top: '42%', right: '6%', rotate: '2deg' },
    float: { y: [8, -8, 8], rotate: ['2deg', '4deg', '2deg'] },
    delay: 0.8,
    content: (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest">
          <Target size={12} /> Maksat
        </div>
        <p className="text-white font-bold text-sm">Täze laptop</p>
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <motion.div className="bg-blue-400 h-full rounded-full"
            initial={{ width: 0 }} animate={{ width: '73%' }}
            transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }} />
        </div>
        <p className="text-white/50 text-xs font-medium">73% tamamlandy</p>
      </div>
    ),
  },
  {
    id: 'ai',
    style: { bottom: '20%', left: '12%', rotate: '1.5deg' },
    float: { y: [-6, 10, -6], rotate: ['1.5deg', '-0.5deg', '1.5deg'] },
    delay: 1.4,
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest">
          <Sparkles size={12} /> AI Geňeşçi
        </div>
        <p className="text-white/80 text-xs font-medium leading-relaxed">
          Bu aý çykdajyňyz 12% azaldy. <span className="text-emerald-400 font-semibold">Ajaýyp netije!</span>
        </p>
      </div>
    ),
  },
]

// ── Dot grid background ───────────────────────────────────────────────
function DotGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  )
}

// ── Clean input field ─────────────────────────────────────────────────
function Field({ label, name, type = 'text', value, onChange, required = true, autoFocus, showPass, togglePass }) {
  const [focused, setFocused] = useState(false)
  const isPass = type === 'password'
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPass ? (showPass ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          autoFocus={autoFocus}
          className={`w-full rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border outline-none transition-all duration-200 ${
            focused
              ? 'border-zinc-900 dark:border-zinc-300 shadow-[0_0_0_3px_rgba(9,9,11,0.08)] dark:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]'
              : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
          } ${isPass ? 'pr-12' : ''}`}
          placeholder={
            name === 'username' ? 'ulanyjy_ady' :
            name === 'email'    ? 'sen@mysal.com' :
            '••••••••'
          }
        />
        {isPass && togglePass && (
          <button type="button" onClick={togglePass}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-0.5">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────
export default function Auth() {
  const [mode,     setMode]     = useState('login')
  const [form,     setForm]     = useState({ username: '', email: '', password: '', password2: '' })
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.username, form.password)
      } else {
        if (form.password !== form.password2) throw new Error('Açar sözler gabat gelmeýär')
        await register(form)
        await login(form.username, form.password)
      }
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 700)
    } catch (err) {
      const data = err.response?.data
      const msg = typeof data === 'object' ? Object.values(data).flat().join(' ') : (err.message || data)
      setError(msg || 'Ýalňyşlyk ýüze çykdy. Gaýtadan synanyşyň.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-zinc-50 dark:bg-zinc-900">

      {/* ── Left panel ── */}
      <motion.section
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
        className="relative bg-zinc-950 overflow-hidden flex-shrink-0 lg:w-[52%] h-56 lg:h-auto"
      >
        <DotGrid />

        {/* Gradient glows */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-500/15 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-violet-500/10 blur-[60px] rounded-full pointer-events-none" />

        {/* Mobile view */}
        <div className="lg:hidden flex items-center justify-center h-full gap-3">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
            <div className="w-3 h-3 rounded-sm bg-zinc-950" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">Talyp Maliýe</span>
        </div>

        {/* Desktop view */}
        <div className="hidden lg:flex flex-col h-full px-14 py-12">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-sm bg-zinc-950" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">Talyp Maliýe</span>
          </motion.div>

          {/* Center */}
          <div className="flex-1 flex flex-col justify-center relative">
            {/* Tagline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="mb-16">
              <h2 className="text-5xl xl:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-5">
                Maliýe ýagdaýyňyzy<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  doly dolandyryň.
                </span>
              </h2>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-sm">
                Çykdajylar, girdeji, maksatlar we AI geňeşçi — ählisi bir ýerde.
              </p>
            </motion.div>

            {/* Floating glass cards */}
            {FLOAT_CARDS.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20, rotate: card.style.rotate }}
                animate={{ opacity: 1, y: 0, rotate: card.style.rotate }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
                className="absolute"
                style={card.style}
              >
                <motion.div
                  animate={card.float}
                  transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: card.delay }}
                  className="bg-white/[0.07] backdrop-blur-sm border border-white/[0.12] rounded-2xl p-4 w-52 shadow-2xl"
                >
                  {card.content}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Bottom features */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="flex items-center gap-6">
            {['AI Geňeşçi', 'Gaýtalanýan çykdajylar', 'Üstünlik kartlary'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                <span className="text-zinc-500 text-xs font-medium">{f}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Right form panel ── */}
      <section className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto">
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="w-full max-w-sm"
          >
            {/* Heading */}
            <div className="mb-8">
              <AnimatePresence mode="wait">
                <motion.div key={mode}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}>
                  <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">
                    {mode === 'login' ? 'Ulgama giriň' : 'Hasap açyň'}
                  </h1>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                    {mode === 'login'
                      ? 'Hasabyňyza giriş üçin maglumatlarňyzy giriziň.'
                      : 'Mugt hasap açyň we maliýe azatlygyny başlaň.'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                <motion.div key={mode}
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4">
                  <Field label="Ulanyjy ady" name="username"
                    value={form.username} onChange={set('username')} autoFocus />
                  {mode === 'register' && (
                    <Field label="Elektron poçta (islege görä)" name="email" type="email"
                      value={form.email} onChange={set('email')} required={false} />
                  )}
                  <Field label="Açar söz" name="password" type="password"
                    value={form.password} onChange={set('password')}
                    showPass={showPass} togglePass={() => setShowPass(s => !s)} />
                  {mode === 'register' && (
                    <Field label="Açar sözi gaýtalaň" name="password2" type="password"
                      value={form.password2} onChange={set('password2')}
                      showPass={showPass} togglePass={() => setShowPass(s => !s)} />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-red-500 dark:text-red-400 text-xs font-medium bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-4 py-3"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading || success}
                whileHover={{ scale: loading || success ? 1 : 1.015 }}
                whileTap={{ scale: loading || success ? 1 : 0.985 }}
                className={`relative w-full py-3.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-colors duration-200 ${
                  success
                    ? 'bg-emerald-600'
                    : 'bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-60'
                }`}
              >
                {/* Subtle shimmer on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                  whileHover={{ x: ['−100%', '200%'] }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {success ? (
                    <><CheckCircle size={16} /> Üstünlikli!</>
                  ) : loading ? (
                    <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                      Ýüklenýär...
                    </motion.span>
                  ) : (
                    <>
                      {mode === 'login' ? 'Giriş et' : 'Hasap döret'}
                      <ArrowRight size={15} strokeWidth={2.5} />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                {mode === 'login' ? 'Hasabyňyz ýokmy?' : 'Eýýäm agzamy?'}
              </span>
              <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
            </div>

            {/* Switch mode */}
            <motion.button
              onClick={switchMode}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
            >
              {mode === 'login' ? 'Mugt hasap açmak' : 'Ulgama giriş et'}
            </motion.button>
          </motion.div>
        </div>

        <p className="text-center text-xs text-zinc-300 dark:text-zinc-700 pb-6 font-medium">
          © 2026 Talyp Maliýe. Ähli hukuklar goraglydyr.
        </p>
      </section>
    </div>
  )
}
