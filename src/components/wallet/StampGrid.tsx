'use client'

import { motion } from 'framer-motion'

interface Props {
  current: number
  max: number
  accentColor?: string
}

export default function StampGrid({ current, max, accentColor = 'oklch(0.76 0.14 78)' }: Props) {
  const cols = max <= 6 ? 3 : max <= 9 ? 3 : 4
  const dots = Array.from({ length: max }, (_, i) => i < current)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 10,
      marginTop: 20,
    }}>
      {dots.map((filled, i) => (
        <motion.div
          key={i}
          initial={filled && i === current - 1 ? { scale: 0, rotate: -15, opacity: 0 } : false}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22, delay: i * 0.025 }}
          style={{
            aspectRatio: '1',
            borderRadius: '50%',
            background: filled
              ? `radial-gradient(circle at 35% 35%, ${accentColor}ee, ${accentColor})`
              : 'oklch(1 0 0 / 0.07)',
            border: `1.5px solid ${filled ? `${accentColor}cc` : 'oklch(1 0 0 / 0.18)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: filled ? `0 0 14px ${accentColor}45` : 'none',
            transition: 'background 0.25s, box-shadow 0.25s',
          }}
        >
          {filled && (
            <span style={{ fontSize: 11, lineHeight: 1 }}>☕</span>
          )}
        </motion.div>
      ))}
    </div>
  )
}
