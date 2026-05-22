import { motion } from 'framer-motion'
import LottiePlayer from './LottiePlayer'

export default function EmptyState({ title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <LottiePlayer type="empty" size={140} className="mb-8 opacity-70" />
      <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-zinc-400 dark:text-zinc-500 text-base font-medium max-w-[300px] leading-relaxed mb-10">{description}</p>
      {action && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
