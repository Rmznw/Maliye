import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import LottiePlayer from './LottiePlayer'

const CONFIG = {
  success: { icon: CheckCircle2, bg: 'bg-zinc-950', text: 'text-white', iconColor: 'text-emerald-400', border: 'border-white/10' },
  error:   { icon: XCircle,      bg: 'bg-red-600',  text: 'text-white', iconColor: 'text-white',        border: 'border-red-500' },
  info:    { icon: Info,         bg: 'bg-blue-600', text: 'text-white', iconColor: 'text-white',        border: 'border-blue-500' },
}

function ToastItem({ id, message, type }) {
  const { remove } = useToast()
  const cfg = CONFIG[type] || CONFIG.success
  const Icon = cfg.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl border ${cfg.bg} ${cfg.text} ${cfg.border} min-w-[280px] max-w-[380px]`}
    >
      {type === 'success' && (
        <div className="flex-shrink-0">
          <LottiePlayer type="success" size={28} />
        </div>
      )}
      {type !== 'success' && <Icon size={20} className={`flex-shrink-0 ${cfg.iconColor}`} />}
      <p className="text-sm font-bold flex-1 leading-snug">{message}</p>
      <button onClick={() => remove(id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </motion.div>
  )
}

export default function ToastContainer() {
  const { toasts } = useToast()
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
