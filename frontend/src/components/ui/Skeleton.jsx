import { motion } from 'framer-motion'

function Bone({ className = '' }) {
  return (
    <motion.div
      className={`bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden relative ${className}`}
      animate={{}}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/5 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', repeatDelay: 0.3 }}
      />
    </motion.div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <Bone className="h-36 md:h-44 rounded-3xl" />
      <div className="grid grid-cols-3 gap-4">
        <Bone className="h-28" />
        <Bone className="h-28" />
        <Bone className="h-28" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Bone className="lg:col-span-2 h-72" />
        <Bone className="h-72" />
      </div>
    </div>
  )
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
      <Bone className="h-10 rounded-none" />
      <div className="p-3 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-1">
            <Bone className="w-10 h-10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-3/4" />
              <Bone className="h-3 w-1/3" />
            </div>
            <Bone className="w-16 h-5 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function GoalsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden">
          <Bone className="h-1.5 rounded-none" />
          <div className="p-6 space-y-4">
            <Bone className="h-5 w-2/3" />
            <div className="flex gap-4 items-center">
              <Bone className="w-20 h-20 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Bone className="h-8 w-full" />
                <Bone className="h-3 w-1/2" />
              </div>
            </div>
            <Bone className="h-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default Bone
