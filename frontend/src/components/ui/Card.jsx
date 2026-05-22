import clsx from 'clsx'

export function Card({ children, className, padding = true, hover = false }) {
  return (
    <div className={clsx(
      'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] transition-all duration-500',
      padding && 'p-8 md:p-12',
      hover && 'hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1',
      !hover && 'shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_20px_-5px_rgba(0,0,0,0.02)]',
      className
    )}>
      {children}
    </div>
  )
}

Card.Header = ({ title, subtitle, action, className }) => (
  <div className={clsx('flex items-center justify-between mb-10 md:mb-16', className)}>
    <div className="space-y-2">
      <h3 className="text-2xl md:text-3xl font-black text-zinc-950 dark:text-white tracking-tighter">{title}</h3>
      {subtitle && <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
)

export function StatCard({ title, value, icon: Icon, color, colorBg, currency = 'TMT' }) {
  return (
    <Card className="flex flex-col gap-10 relative group overflow-hidden border-zinc-100/50 dark:border-zinc-800/50 !p-10 hover:border-zinc-950 dark:hover:border-zinc-400 transition-colors duration-700">
      <div className="flex items-center justify-between relative z-10">
        <div className={clsx('w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-xl border border-black/[0.03]', colorBg)}>
          <Icon className={color} size={28} strokeWidth={2.5} />
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 mb-3">{title}</p>
          <div className="flex items-baseline justify-end gap-2">
            <span className="text-4xl font-black text-zinc-950 dark:text-white tracking-tighter group-hover:tracking-tight transition-all duration-700">
              {Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">{currency}</span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-10 -left-10 opacity-[0.03] group-hover:opacity-[0.08] group-hover:rotate-12 transition-all duration-1000">
        <Icon size={160} strokeWidth={1} />
      </div>
    </Card>
  )
}

export default Card
