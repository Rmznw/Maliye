import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, ArrowLeft, Brain, QrCode, Target, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import LottiePlayer from './ui/LottiePlayer'
import Button from './ui/Button'

const TOTAL_STEPS = 5

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '50%' : '-50%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-50%' : '50%', opacity: 0 }),
}
const transition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] }

function StepDots({ current }) {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((i) => (
        <motion.div
          key={i}
          animate={{ width: i === current ? 28 : 8, opacity: i === current ? 1 : 0.25 }}
          transition={{ duration: 0.3 }}
          className="h-1.5 rounded-full bg-zinc-900 dark:bg-white"
        />
      ))}
    </div>
  )
}

// ── Step 3: Feature tour cards ────────────────────────────────────────
const FEATURES = [
  {
    icon: Brain,
    color: '#3b82f6',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    title: 'AI Geňeşçi',
    desc: 'Hakyky maliýe maglumatyňa esaslanyp anyk maslahat alarsyň. Islendik soragy türkmen dilinde ýaz.',
  },
  {
    icon: QrCode,
    color: '#10b981',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    title: 'QR & SMS Skaneri',
    desc: 'Kwitansiýaňy kamera bilen skanirle ýa-da bank SMS-ini göçür. AI özüçe awtomatik gurýar.',
  },
  {
    icon: Target,
    color: '#8b5cf6',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    title: 'Tygşytlyk Maksatlar',
    desc: 'Noutbuk, syýahat ýa islendik maksat. Progressiňi görkezýäris, ýeteniňde konfetti bilen belleýäris!',
  },
]

function FeatureTour() {
  const [idx, setIdx] = useState(0)
  const [fDir, setFDir] = useState(1)
  const f = FEATURES[idx]
  const Icon = f.icon

  const prev = () => { if (idx > 0) { setFDir(-1); setIdx(idx - 1) } }
  const next = () => { if (idx < FEATURES.length - 1) { setFDir(1); setIdx(idx + 1) } }

  return (
    <div className="w-full space-y-4">
      {/* Card */}
      <div className="relative overflow-hidden min-h-[200px]">
        <AnimatePresence custom={fDir} mode="wait">
          <motion.div
            key={idx}
            custom={fDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`${f.bg} rounded-2xl p-6 flex flex-col items-center gap-4 text-center`}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: f.color + '20' }}>
              <Icon size={26} style={{ color: f.color }} />
            </div>
            <div>
              <p className="font-black text-zinc-900 dark:text-white text-base">{f.title}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-snug mt-1">{f.desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav row */}
      <div className="flex items-center justify-between">
        <button onClick={prev} disabled={idx === 0}
          className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center disabled:opacity-30 transition-opacity">
          <ChevronLeft size={18} className="text-zinc-700 dark:text-zinc-300" />
        </button>
        <div className="flex gap-1.5">
          {FEATURES.map((_, i) => (
            <motion.div key={i} animate={{ width: i === idx ? 20 : 7, opacity: i === idx ? 1 : 0.3 }}
              transition={{ duration: 0.2 }}
              className="h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 cursor-pointer"
              onClick={() => { setFDir(i > idx ? 1 : -1); setIdx(i) }}
            />
          ))}
        </div>
        <button onClick={next} disabled={idx === FEATURES.length - 1}
          className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center disabled:opacity-30 transition-opacity">
          <ChevronRight size={18} className="text-zinc-700 dark:text-zinc-300" />
        </button>
      </div>
    </div>
  )
}

// ── Step 4: First expense form ────────────────────────────────────────
const CATS = [
  { value: 'food',       label: 'Iýmit' },
  { value: 'transport',  label: 'Ulag' },
  { value: 'education',  label: 'Bilim' },
  { value: 'internet',   label: 'Internet' },
  { value: 'leisure',    label: 'Dynç alyş' },
  { value: 'health',     label: 'Saglyk' },
  { value: 'other',      label: 'Beýleki' },
]

function FirstExpenseForm({ onDone, onSkip }) {
  const [amount, setAmount]     = useState('')
  const [category, setCategory] = useState('food')
  const [title, setTitle]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) { setError('Dogry möçber giriziň'); return }
    setLoading(true); setError('')
    try {
      const today = new Date().toISOString().split('T')[0]
      await api.post('expenses/', {
        title: title.trim() || CATS.find(c => c.value === category)?.label || category,
        amount: parseFloat(amount),
        category,
        date: today,
      })
      onDone()
    } catch {
      setError('Ýalňyşlyk ýüze çykdy.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex gap-2">
        <input
          type="number" min="0" step="0.01" placeholder="0.00"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError('') }}
          className="flex-1 input-zinc font-black text-xl text-center"
          autoFocus
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-zinc font-bold w-28">
          {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <input
        type="text" placeholder="Bellik (islege görä)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full input-zinc text-sm"
      />
      {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
      <Button size="lg" className="w-full py-4" onClick={handleSave} loading={loading}>
        Saklat
      </Button>
      <button onClick={onSkip}
        className="flex items-center justify-center w-full py-3 text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
        Geçir
      </button>
    </div>
  )
}

// ── Main Onboarding ───────────────────────────────────────────────────
export default function Onboarding({ onClose }) {
  const [step, setStep]     = useState(1)
  const [dir, setDir]       = useState(1)
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('TMT')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const { fetchMe, user } = useAuthStore()

  const go = (n) => { setDir(n > step ? 1 : -1); setStep(n) }

  const handleBudgetSubmit = async () => {
    if (!budget || parseFloat(budget) <= 0) { setError('Dogry möçber giriziň'); return }
    setLoading(true); setError('')
    try {
      await api.patch('auth/me/', { monthly_budget: parseFloat(budget), currency })
      go(3)
    } catch {
      setError('Ýalňyşlyk ýüze çykdy. Gaýtadan synanyşyň.')
    } finally { setLoading(false) }
  }

  const handleDone = () => {
    fetchMe()
    onClose()
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-white dark:bg-zinc-900 flex flex-col overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex-shrink-0 flex justify-center pt-10 pb-4">
        <StepDots current={step} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-6 py-6">
          <div className="w-full max-w-sm overflow-hidden">
            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={step}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="flex flex-col items-center text-center gap-6"
              >

                {/* ── Step 1: Welcome ── */}
                {step === 1 && (
                  <>
                    <LottiePlayer type="finance" size={140} className="sm:scale-100 scale-90" />
                    <div className="space-y-2">
                      <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
                        Hoş geldiňiz{user?.username ? `, ${user.username}` : ''}!
                      </h1>
                      <p className="text-zinc-400 dark:text-zinc-500 text-base font-medium leading-snug">
                        Maliýe ýagdaýyňyzy dolandyrmak üçin birnäçe ädim ädeweriň.
                      </p>
                    </div>
                    <Button size="lg" className="w-full py-4" onClick={() => go(2)}>
                      Başlalyň
                    </Button>
                    <button onClick={handleDone}
                      className="text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                      Geçir
                    </button>
                  </>
                )}

                {/* ── Step 2: Budget ── */}
                {step === 2 && (
                  <>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] bg-zinc-950 dark:bg-white flex items-center justify-center shadow-2xl shadow-zinc-900/20">
                      <Wallet size={28} className="text-white dark:text-zinc-900" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                        Aýlyk býujet
                      </h2>
                      <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium leading-snug">
                        Bu sizi çykdajylary gözegçilikde saklamaga kömek edýär.
                      </p>
                    </div>
                    <div className="w-full space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="number" min="0" step="0.01" placeholder="0.00"
                          value={budget}
                          onChange={(e) => { setBudget(e.target.value); setError('') }}
                          className="flex-1 input-zinc font-black text-xl text-center"
                          autoFocus
                        />
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-zinc font-bold w-20">
                          <option value="TMT">TMT</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                      {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                      <Button size="lg" className="w-full py-4" onClick={handleBudgetSubmit} loading={loading}>
                        Dowam et
                      </Button>
                      <button onClick={() => go(1)}
                        className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={14} /> Yza
                      </button>
                    </div>
                  </>
                )}

                {/* ── Step 3: Feature tour ── */}
                {step === 3 && (
                  <>
                    <div className="space-y-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                        Esasy aýratynlyklar
                      </h2>
                      <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">
                        Sizi nämeleriň garaşýanyny görüň
                      </p>
                    </div>
                    <FeatureTour />
                    <Button size="lg" className="w-full py-4" onClick={() => go(4)}>
                      Dowam et
                    </Button>
                    <button onClick={() => go(2)}
                      className="flex items-center justify-center gap-2 w-full py-2 text-sm font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      <ArrowLeft size={14} /> Yza
                    </button>
                  </>
                )}

                {/* ── Step 4: First expense ── */}
                {step === 4 && (
                  <>
                    <div className="space-y-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                        Ilkinji çykdajyňy goş
                      </h2>
                      <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">
                        Häzirki günki bir çykdajyňy giriziň
                      </p>
                    </div>
                    <FirstExpenseForm onDone={() => go(5)} onSkip={() => go(5)} />
                    <button onClick={() => go(3)}
                      className="flex items-center justify-center gap-2 w-full py-1 text-sm font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      <ArrowLeft size={14} /> Yza
                    </button>
                  </>
                )}

                {/* ── Step 5: Done ── */}
                {step === 5 && (
                  <>
                    <LottiePlayer type="celebration" size={120} />
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                        Ajaýyp! Siz taýýar.
                      </h2>
                      <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium leading-snug">
                        Maliýe dünýäňize hoş geldiňiz!<br />
                        AI geňeşçiňiz kömege taýýar.
                      </p>
                    </div>
                    <Button size="lg" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500" onClick={handleDone}>
                      Görmäge git
                    </Button>
                  </>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Safe area spacer for iPhone home bar */}
      <div className="flex-shrink-0" style={{ height: 'env(safe-area-inset-bottom)' }} />
    </motion.div>,
    document.body
  )
}
