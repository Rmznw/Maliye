import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Wallet, Brain, QrCode, Target, BarChart2, RefreshCw, ShieldCheck,
  ArrowRight, Sparkles, Zap, Globe,
} from 'lucide-react'
import { MeshBackground } from '../components/ui/LottiePlayer'
import AnimatedNumber from '../components/ui/AnimatedNumber'

// ── Phone mock shown in hero ──────────────────────────────────────────
function PhoneMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -8 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-[280px] sm:w-[300px]"
      style={{ perspective: 800 }}
    >
      {/* Glow behind phone */}
      <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full scale-110 pointer-events-none" />

      {/* Phone shell */}
      <div className="relative bg-zinc-950 rounded-[2.5rem] p-1.5 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
        <div className="bg-zinc-900 rounded-[2.2rem] overflow-hidden">
          {/* Status bar */}
          <div className="flex justify-between items-center px-5 pt-4 pb-2">
            <span className="text-white text-[10px] font-bold opacity-60">9:41</span>
            <div className="w-16 h-4 bg-zinc-950 rounded-full" />
            <div className="flex gap-1.5 items-center opacity-60">
              <div className="w-3 h-2 bg-white rounded-[2px]" />
              <div className="text-white text-[10px] font-bold">5G</div>
            </div>
          </div>

          <div className="px-4 pb-6 space-y-3">
            {/* Balance card */}
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="rounded-2xl p-4"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #312e81 100%)' }}
            >
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">Balans</p>
              <p className="text-white text-2xl font-black tracking-tight">4 280 TMT</p>
              <div className="flex gap-3 mt-3">
                {/* Mini sparkline */}
                <svg width="80" height="28" viewBox="0 0 80 28">
                  <motion.path
                    d="M 0 22 L 13 18 L 27 14 L 40 9 L 53 5 L 67 10 L 80 3"
                    fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
                <div className="ml-auto bg-emerald-500/20 rounded-lg px-2 py-0.5 flex items-center gap-1">
                  <span className="text-emerald-400 text-[9px] font-black">+12%</span>
                </div>
              </div>
            </motion.div>

            {/* Stat row */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Girdeji', value: '5 000', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Çykdajy', value: '720', color: 'text-red-400',     bg: 'bg-red-500/10' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                  <p className="text-zinc-500 text-[9px] font-bold uppercase">{s.label}</p>
                  <p className={`${s.color} text-sm font-black`}>{s.value} TMT</p>
                </div>
              ))}
            </div>

            {/* AI chip */}
            <motion.div
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="bg-zinc-800 rounded-2xl p-3 flex items-start gap-2.5"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Brain size={10} className="text-white" />
              </div>
              <div>
                <p className="text-zinc-400 text-[9px] font-bold uppercase mb-0.5">AI Geňeşçi</p>
                <p className="text-zinc-200 text-[10px] font-semibold leading-snug">
                  Bu aý iýmite 45% sarp etdiňiz. Tygşytlamak üçin…
                </p>
              </div>
            </motion.div>

            {/* Goal bar */}
            <div className="bg-zinc-800 rounded-2xl p-3 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-zinc-300 text-[10px] font-bold">Noutbuk 💻</p>
                <p className="text-zinc-400 text-[10px] font-bold">73%</p>
              </div>
              <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }} animate={{ width: '73%' }}
                  transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="text-zinc-500 text-[9px]">1 460 / 2 000 TMT</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Feature card ──────────────────────────────────────────────────────
const FEATURES = [
  { icon: Brain,      color: '#3b82f6', bg: '#eff6ff', darkBg: '#1e3a5f', title: 'AI Geňeşçi',          desc: 'Maliýe ýagdaýyňa görä anyk we şahsy maslahat' },
  { icon: QrCode,     color: '#10b981', bg: '#ecfdf5', darkBg: '#134e35', title: 'QR / SMS Skaneri',    desc: 'Kwitansiýany bir sekuntda kamera bilen gir' },
  { icon: Target,     color: '#8b5cf6', bg: '#f5f3ff', darkBg: '#2e1f5e', title: 'Tygşytlyk Maksatlar', desc: 'Maksat goý, progress yz, gutarnykly' },
  { icon: BarChart2,  color: '#f59e0b', bg: '#fffbeb', darkBg: '#4c3000', title: 'Analitika',           desc: 'Kategoriýa boýunça grafik we paýlanma' },
  { icon: RefreshCw,  color: '#ef4444', bg: '#fef2f2', darkBg: '#4c1515', title: 'Gaýtalanýan Çykdajy', desc: 'Abonent töleglerini awtomatik hasapla' },
  { icon: ShieldCheck, color: '#06b6d4', bg: '#ecfeff', darkBg: '#0c3a4a', title: 'Howpsuz & Mugt',    desc: 'Şahsy maglumat goralan, 0 töleg hemişelik' },
]

function FeatureCard({ f, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = f.icon
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: f.color + '20' }}>
        <Icon size={20} style={{ color: f.color }} />
      </div>
      <div>
        <p className="font-black text-zinc-900 dark:text-white text-sm tracking-tight">{f.title}</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs font-medium leading-snug mt-0.5">{f.desc}</p>
      </div>
    </motion.div>
  )
}

// ── How it works step ─────────────────────────────────────────────────
const STEPS = [
  { n: '01', title: 'Hasap aç',              sub: '30 sekuntda mugt hasap dörediň',           color: '#3b82f6' },
  { n: '02', title: 'Býujet & girdeji goş',  sub: 'Aýlyk býujetiňizi we girdejileri giriziň', color: '#10b981' },
  { n: '03', title: 'AI bilen ösdür',        sub: 'Geňeşçiňiz size her gün maslahat berýär',  color: '#8b5cf6' },
]

function HowStep({ s, index, total }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="flex flex-col items-center text-center flex-1 relative"
    >
      {/* Connector line */}
      {index < total - 1 && (
        <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] right-[-calc(50%-28px)] h-px bg-zinc-100 dark:bg-zinc-800" style={{ width: 'calc(100% - 56px)' }} />
      )}
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg mb-4 relative z-10"
        style={{ backgroundColor: s.color }}>
        {s.n}
      </div>
      <p className="font-black text-zinc-900 dark:text-white text-sm tracking-tight">{s.title}</p>
      <p className="text-zinc-400 dark:text-zinc-500 text-xs font-medium leading-snug mt-1 max-w-[140px]">{s.sub}</p>
    </motion.div>
  )
}

// ── Stat ──────────────────────────────────────────────────────────────
function Stat({ value, suffix, label, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col items-center"
    >
      <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
        <AnimatedNumber value={value} />{suffix}
      </p>
      <p className="text-zinc-400 text-xs font-semibold mt-1">{label}</p>
    </motion.div>
  )
}

// ── Main Landing component ────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const go = () => navigate('/auth')

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Wallet size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-zinc-900 dark:text-white tracking-tight text-sm">Talyp Maliýe</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={go}
              className="px-4 py-2 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              Giriş
            </button>
            <button onClick={go}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              Mugt başla
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <MeshBackground />
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12 md:gap-8 relative z-10">

          {/* Left copy */}
          <div className="flex-1 flex flex-col items-start gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-full px-3 py-1.5"
            >
              <Sparkles size={12} className="text-blue-600" />
              <span className="text-blue-700 dark:text-blue-400 text-xs font-bold">AI-powered · Mugt · Türkmen dili</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] text-zinc-900 dark:text-white"
            >
              Talyp üçin<br />
              <span className="text-blue-600">akylly</span> maliýe<br />
              ýoldaşy
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg font-medium leading-relaxed max-w-md"
            >
              Çykdajy, girdeji, maksat we AI geňeşçi — ählisi bir ýerde, hemişelik mugt.
              Maliýe ýagdaýyňy doly gözegçilikde sakla.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              <button onClick={go}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]">
                Mugt başla <ArrowRight size={16} />
              </button>
              <button onClick={go}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Giriş et
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 flex-wrap"
            >
              {[
                { icon: Brain,      label: 'AI Geňeşçi' },
                { icon: Zap,        label: 'Mugt hemişelik' },
                { icon: Globe,      label: 'Türkmen dili' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                  <Icon size={13} />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — phone mock */}
          <div className="flex-shrink-0 flex justify-center">
            <PhoneMock />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <div className="text-center mb-10">
          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-2">Näme bar?</p>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Maliýe dolandyrmak üçin<br className="hidden sm:block" /> ähli zat bir ýerde
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} index={i} />)}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white dark:bg-zinc-900 border-y border-zinc-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-2">Nädip başlamaly?</p>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">3 ädimde taýýar</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-8 md:gap-4">
            {STEPS.map((s, i) => <HowStep key={s.n} s={s} index={i} total={STEPS.length} />)}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-zinc-950 dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-5 py-14 md:py-16">
          <div className="grid grid-cols-3 gap-6 md:gap-12 text-center divide-x divide-zinc-800">
            <Stat value={1000}  suffix="+"   label="Talyp ulanyjy"    index={0} />
            <Stat value={50000} suffix=" TMT" label="Yzarlandy"       index={1} />
            <Stat value={98}    suffix="%"    label="Kanagatlanma"    index={2} />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-10 md:p-16 text-center overflow-hidden"
        >
          <MeshBackground />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/30">
              <Wallet size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Maliýe ýagdaýyňy<br className="hidden sm:block" /> bu gün doly gözegçilikde sakla
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base font-medium">
                Mugt hasap aç. Kart gerek däl.
              </p>
            </div>
            <button onClick={go}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base transition-all shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]">
              Mugt başla <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <Wallet size={12} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-zinc-900 dark:text-white text-xs tracking-tight">Talyp Maliýe</span>
          </div>
          <p className="text-zinc-400 text-xs font-medium">Türkmenistan talyplar üçin maliýe ýoldaşy</p>
          <p className="text-zinc-400 text-xs">© 2025 Talyp Maliýe</p>
        </div>
      </footer>
    </div>
  )
}
