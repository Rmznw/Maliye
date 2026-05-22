import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export default function AnimatedNumber({ value, decimals = 0, prefix = '', suffix = '', className = '', duration = 1.4 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const target = parseFloat(value) || 0

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const from = 0
    const raf = (now) => {
      const t = Math.min((now - start) / (duration * 1000), 1)
      const ease = 1 - Math.pow(1 - t, 4)
      setDisplay(from + (target - from) * ease)
      if (t < 1) requestAnimationFrame(raf)
      else setDisplay(target)
    }
    requestAnimationFrame(raf)
  }, [inView, target])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}
