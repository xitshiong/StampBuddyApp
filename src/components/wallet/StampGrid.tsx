'use client'

import { motion } from 'framer-motion'

interface Props {
  current: number
  max: number
  accentColor?: string
  stampShape?: string
}

export default function StampGrid({ current, max, accentColor = 'oklch(0.50 0.16 28)', stampShape = 'circle' }: Props) {
  const cols = max <= 6 ? 3 : max <= 10 ? 4 : 5
  const gap = max > 10 ? 6 : 8
  const maxSize = max <= 6 ? 64 : max <= 10 ? 54 : 44
  const dots = Array.from({ length: max }, (_, i) => i < current)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: gap,
      marginTop: 12,
    }}>
      {dots.map((filled, i) => (
        <motion.div
          key={i}
          initial={filled && i === current - 1 ? { scale: 0, rotate: -15, opacity: 0 } : false}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22, delay: i * 0.025 }}
          style={{
            aspectRatio: '1',
            width: '100%',
            maxWidth: maxSize,
            maxHeight: maxSize,
            margin: '0 auto',
            borderRadius: '50%',
            background: filled
              ? `radial-gradient(circle at 35% 35%, ${accentColor}ee, ${accentColor})`
              : `color-mix(in srgb, ${accentColor} 8%, transparent)`,
            border: `2.5px solid ${accentColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: filled ? `0 0 14px ${accentColor}45` : 'none',
            transition: 'background 0.25s, box-shadow 0.25s',
          }}
        >
          {filled && stampShape === 'circle' && (
            <div style={{ width: '40%', height: '40%', borderRadius: '50%', background: 'white' }} />
          )}
          {filled && stampShape === 'star' && (
            <svg viewBox="0 0 24 24" fill="white" style={{ width: '50%', height: '50%' }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  )
}
