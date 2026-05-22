import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

export function useConfetti() {
  const fire = (opts = {}) => {
    confetti({
      particleCount: opts.count || 120,
      spread: opts.spread || 80,
      origin: opts.origin || { x: 0.5, y: 0.6 },
      colors: opts.colors || ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
      scalar: opts.scalar || 1.1,
      ...opts,
    })
  }

  const celebrate = () => {
    fire({ count: 80, spread: 60, origin: { x: 0.25, y: 0.6 } })
    setTimeout(() => fire({ count: 80, spread: 60, origin: { x: 0.75, y: 0.6 } }), 200)
    setTimeout(() => fire({ count: 60, spread: 100, origin: { x: 0.5, y: 0.5 }, scalar: 1.3 }), 400)
  }

  const burst = (x = 0.5, y = 0.6) => {
    fire({ count: 60, spread: 50, origin: { x, y } })
  }

  return { fire, celebrate, burst }
}

// Star burst for goal completion
export function GoalConfetti({ active }) {
  const fired = useRef(false)
  const { celebrate } = useConfetti()

  useEffect(() => {
    if (active && !fired.current) {
      fired.current = true
      celebrate()
    }
    if (!active) fired.current = false
  }, [active])

  return null
}
