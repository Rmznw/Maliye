import { motion } from 'framer-motion'

// ── Loading: three bouncing dots ──────────────────────────────────────
function LoadingDots({ color = '#18181b', size = 64 }) {
  return (
    <svg width={size * 2.5} height={size} viewBox="0 0 100 40">
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx={20 + i * 30} cy="20" r="9" fill={color}
          animate={{ y: [-7, 7, -7], opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15, ease: 'easeInOut' }} />
      ))}
    </svg>
  )
}

// ── Empty inbox with floating stars ──────────────────────────────────
function EmptyBox({ size = 140 }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 140 140"
      animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}>
      <rect x="25" y="72" width="90" height="58" rx="10" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="2" />
      <path d="M 25 72 L 70 50 L 115 72" fill="#e4e4e7" stroke="#d4d4d8" strokeWidth="2" strokeLinejoin="round" />
      <line x1="42" y1="92" x2="98" y2="92" stroke="#d4d4d8" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="42" y1="107" x2="80" y2="107" stroke="#e4e4e7" strokeWidth="3.5" strokeLinecap="round" />
      {[{ cx: 18, cy: 35, r: 4, d: 0 }, { cx: 122, cy: 25, r: 3, d: 0.5 }, { cx: 110, cy: 55, r: 3.5, d: 1.2 }, { cx: 30, cy: 60, r: 2.5, d: 0.4 }].map((s, i) => (
        <motion.circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#d4d4d8"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
          transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: s.d }} />
      ))}
    </motion.svg>
  )
}

// ── Success checkmark ─────────────────────────────────────────────────
function SuccessCheck({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <motion.circle cx="50" cy="50" r="46" fill="#ecfdf5" stroke="#10b981" strokeWidth="2"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
      <motion.path d="M 26 50 L 43 67 L 74 36" fill="none" stroke="#10b981" strokeWidth="6"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }} />
    </svg>
  )
}

// ── Finance bar chart ─────────────────────────────────────────────────
function FinanceChart({ size = 160 }) {
  const bars = [
    { x: 8,   h: 55, color: '#18181b', delay: 0 },
    { x: 46,  h: 95, color: '#3b82f6', delay: 0.1 },
    { x: 84,  h: 45, color: '#18181b', delay: 0.2 },
    { x: 122, h: 80, color: '#10b981', delay: 0.3 },
  ]
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 160 120" overflow="visible">
      {bars.map((bar, i) => (
        <motion.rect key={i} x={bar.x} width="32" rx="7" fill={bar.color}
          initial={{ height: 0, y: 105 }} animate={{ height: bar.h, y: 105 - bar.h }}
          transition={{ duration: 0.9, delay: bar.delay, ease: [0.22, 1, 0.36, 1] }} />
      ))}
      <motion.circle cx="152" cy="18" r="12" fill="#fbbf24"
        animate={{ y: [-5, 5, -5], rotate: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} />
      <motion.circle cx="6" cy="22" r="8" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="1.5"
        animate={{ y: [4, -4, 4] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} />
      <motion.circle cx="80" cy="10" r="5" fill="#e4e4e7"
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0.8 }} />
    </svg>
  )
}

// ── Animated wallet / hero ────────────────────────────────────────────
function WalletHero({ size = 180 }) {
  return (
    <motion.svg width={size} height={size * 0.7} viewBox="0 0 180 126">
      {/* Card body */}
      <motion.rect x="10" y="20" width="160" height="96" rx="18" fill="#18181b"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
      {/* Chip */}
      <motion.rect x="28" y="52" width="32" height="24" rx="5" fill="#fbbf24"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
      {/* Lines */}
      <motion.line x1="28" y1="40" x2="72" y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />
      <motion.line x1="28" y1="92" x2="100" y2="92" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.4 }} />
      <motion.line x1="28" y1="102" x2="80" y2="102" stroke="white" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.55, duration: 0.4 }} />
      {/* Balance chip */}
      <motion.rect x="110" y="84" width="48" height="24" rx="8" fill="#3b82f6"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring', stiffness: 400 }} />
      <motion.text x="134" y="100" textAnchor="middle" fontSize="8" fontWeight="800" fill="white"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
        +4,280
      </motion.text>
      {/* Floating coins */}
      {[{ cx: 158, cy: 12, r: 14, color: '#fbbf24', delay: 0.2 }, { cx: 20, cy: 14, r: 9, color: '#10b981', delay: 0.4 }, { cx: 140, cy: 118, r: 7, color: '#f97316', delay: 0.6 }].map((c, i) => (
        <motion.circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [-3, 3, -3] }}
          transition={{ scale: { delay: c.delay, type: 'spring', stiffness: 300 }, opacity: { delay: c.delay }, y: { repeat: Infinity, duration: 2.5, delay: c.delay, ease: 'easeInOut' } }} />
      ))}
    </motion.svg>
  )
}

// ── Trend arrow going up ──────────────────────────────────────────────
function TrendUp({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 120 84">
      {/* Grid lines */}
      {[20, 40, 60, 80].map(y => (
        <line key={y} x1="0" y1={y} x2="120" y2={y} stroke="#e4e4e7" strokeWidth="1" strokeDasharray="4 4" />
      ))}
      {/* Trend line */}
      <motion.path d="M 0 75 L 20 65 L 40 55 L 60 40 L 80 25 L 100 15 L 120 5"
        fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} />
      {/* Area */}
      <motion.path d="M 0 75 L 20 65 L 40 55 L 60 40 L 80 25 L 100 15 L 120 5 L 120 84 L 0 84 Z"
        fill="#10b981" fillOpacity="0.08"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
      {/* End dot */}
      <motion.circle cx="120" cy="5" r="6" fill="#10b981"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: 'spring', stiffness: 400 }} />
      {/* Arrow head */}
      <motion.path d="M 108 0 L 120 5 L 115 17" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5, duration: 0.3 }} />
    </svg>
  )
}

// ── Celebration stars burst ────────────────────────────────────────────
function Celebration({ size = 120 }) {
  const stars = [
    { cx: 60, cy: 60, r: 16, color: '#fbbf24' },
    { cx: 20, cy: 30, r: 8,  color: '#10b981', delay: 0.1 },
    { cx: 100, cy: 25, r: 10, color: '#3b82f6', delay: 0.15 },
    { cx: 15, cy: 75, r: 7,  color: '#ec4899', delay: 0.2 },
    { cx: 105, cy: 80, r: 9, color: '#8b5cf6', delay: 0.1 },
    { cx: 55, cy: 10, r: 6,  color: '#f97316', delay: 0.25 },
    { cx: 110, cy: 50, r: 5, color: '#06b6d4', delay: 0.2 },
    { cx: 10, cy: 50, r: 6,  color: '#f43f5e', delay: 0.15 },
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      {stars.map((s, i) => (
        <motion.circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.8], y: [0, -8, 0] }}
          transition={{ duration: 0.6, delay: (s.delay || 0) + i * 0.04, repeat: Infinity, repeatDelay: 1.5, ease: [0.22, 1, 0.36, 1] }} />
      ))}
      <motion.text x="60" y="68" textAnchor="middle" fontSize="22" fontWeight="900" fill="#18181b"
        initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}>
        ★
      </motion.text>
    </svg>
  )
}

// ── Floating coins ─────────────────────────────────────────────────────
function Coins({ size = 100 }) {
  const coins = [
    { x: 50, y: 20, r: 22, color: '#fbbf24', delay: 0 },
    { x: 18, y: 60, r: 14, color: '#f59e0b', delay: 0.15 },
    { x: 82, y: 58, r: 16, color: '#d97706', delay: 0.08 },
    { x: 38, y: 88, r: 10, color: '#fbbf24', delay: 0.25 },
    { x: 72, y: 90, r: 9,  color: '#f59e0b', delay: 0.2 },
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {coins.map((c, i) => (
        <motion.g key={i}>
          <motion.circle cx={c.x} cy={c.y} r={c.r} fill={c.color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [-4, 4, -4] }}
            transition={{
              scale: { delay: c.delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
              opacity: { delay: c.delay, duration: 0.3 },
              y: { repeat: Infinity, duration: 2 + i * 0.3, delay: c.delay, ease: 'easeInOut' }
            }} />
          <motion.circle cx={c.x} cy={c.y} r={c.r - 5} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"
            initial={{ opacity: 0 }} animate={{ opacity: 1, y: [-4, 4, -4] }}
            transition={{ opacity: { delay: c.delay + 0.1 }, y: { repeat: Infinity, duration: 2 + i * 0.3, delay: c.delay, ease: 'easeInOut' } }} />
        </motion.g>
      ))}
    </svg>
  )
}

// ── Animated mesh gradient background ─────────────────────────────────
export function MeshBackground({ className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', top: '-20%', left: '-10%' }}
        animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
        style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', bottom: '-15%', right: '-10%' }}
        animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
      <motion.div className="absolute w-[350px] h-[350px] rounded-full blur-[80px] opacity-20"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', top: '40%', left: '45%' }}
        animate={{ x: [0, -30, 30, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }} />
    </div>
  )
}

// ── Registry ───────────────────────────────────────────────────────────
const ANIMATIONS = {
  loading:     LoadingDots,
  empty:       EmptyBox,
  success:     SuccessCheck,
  finance:     FinanceChart,
  wallet:      WalletHero,
  trend:       TrendUp,
  celebration: Celebration,
  coins:       Coins,
}

export default function LottiePlayer({ type = 'loading', size, color, className = '' }) {
  const Component = ANIMATIONS[type] || LoadingDots
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Component size={size} color={color} />
    </div>
  )
}
