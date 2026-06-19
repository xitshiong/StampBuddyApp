'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onGenerate: (count: number) => void
  loading: boolean
}

const KEYS = ['1','2','3','4','5','6','7','8','9','⌫','0','✓']

export default function NumPad({ onGenerate, loading }: Props) {
  const [value, setValue] = useState('')

  function press(key: string) {
    if (key === '⌫') { setValue(v => v.slice(0, -1)); return }
    if (key === '✓') {
      const n = parseInt(value, 10)
      if (!n || n < 1 || n > 20) return
      onGenerate(n)
      setValue('')
      return
    }
    if (value.length >= 2) return
    setValue(v => v + key)
  }

  const count = parseInt(value, 10) || 0
  const valid = count >= 1 && count <= 20

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Display */}
      <div style={{
        width: '100%', padding: '22px 24px 18px',
        borderRadius: 20,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-soft)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 11, color: 'var(--text-muted)', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10,
        }}>Stamps to award</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={value || 'empty'}
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 64, fontWeight: 800,
              letterSpacing: '-3px', lineHeight: 1,
              color: value ? 'var(--text-primary)' : 'var(--border)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value || '0'}
          </motion.div>
        </AnimatePresence>
        {value && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, fontWeight: 500 }}>
            {count} stamp{count !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 9, width: '100%',
      }}>
        {KEYS.map((key) => {
          const isConfirm = key === '✓'
          const isBack    = key === '⌫'
          const disabled  = (isConfirm && !valid) || loading

          return (
            <motion.button
              key={key}
              onClick={() => press(key)}
              disabled={disabled}
              whileTap={disabled ? {} : { scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 600, damping: 30 }}
              style={{
                padding: '19px 0', borderRadius: 16, border: 'none',
                background: isConfirm && valid
                  ? 'var(--accent)'
                  : isBack
                  ? 'var(--bg-surface)'
                  : 'var(--bg-elevated)',
                color: isConfirm && valid
                  ? 'var(--accent-text)'
                  : disabled && isConfirm
                  ? 'var(--border)'
                  : 'var(--text-primary)',
                fontSize: isConfirm ? 19 : isBack ? 17 : 22,
                fontWeight: isConfirm ? 800 : 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)',
                outline: isConfirm && valid ? 'none' : '1px solid var(--border-soft)',
                boxShadow: isConfirm && valid ? '0 4px 20px var(--accent-dim)' : 'none',
                transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
              }}
            >
              {loading && isConfirm ? '…' : key}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
