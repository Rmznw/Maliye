import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  ...props
}) {
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.1)_inset]',
    secondary: 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
    ghost: 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800',
    accent: 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_1px_2px_rgba(0,0,0,0.1)]',
    danger: 'bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30',
  }

  const sizes = {
    sm: 'px-3.5 py-2 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-4 text-base rounded-2xl',
  }

  return (
    <button
      disabled={loading || props.disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none tracking-tight',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  )
}
