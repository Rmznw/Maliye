import { motion } from 'framer-motion'

export default function Sparkline({ data = [], color = '#18181b', width = 80, height = 36, fill = false }) {
  const values = (data || []).map(Number).filter(n => !isNaN(n) && isFinite(n))
  if (values.length < 2) return <div style={{ width, height }} />

  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = (max - min) || 1
  const pad = 3

  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * width,
    height - pad - ((v - min) / range) * (height - pad * 2),
  ])

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {fill && (
        <motion.path d={area} fill={color} fillOpacity={0.12}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
      )}
      <motion.path
        d={line} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  )
}
