'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { LoyaltyCardWithBusiness } from '@/types/database'
import StampGrid from './StampGrid'
import QRScanner from './QRScanner'
import VoucherCard from './VoucherCard'
import { getCardColor } from '@/lib/utils'

interface Props {
  card: LoyaltyCardWithBusiness
  isActive: boolean
  stackIndex: number
  onTap: () => void
  onStampsUpdated: (cardId: string, newStamps: number) => void
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function WalletCard({ card, isActive, stackIndex, onTap, onStampsUpdated }: Props) {
  const [showScanner, setShowScanner] = useState(false)
  const { businesses: biz } = card
  const isComplete = card.current_stamps >= biz.max_stamps
  const colors = getCardColor(biz.color)
  const pct = Math.round((card.current_stamps / biz.max_stamps) * 100)
  const stampsLeft = biz.max_stamps - card.current_stamps

  return (
    <>
      <motion.div
        layout
        onClick={onTap}
        animate={{
          y: isActive ? 0 : stackIndex * 10,
          scale: isActive ? 1 : 1 - stackIndex * 0.028,
          zIndex: 50 - stackIndex,
        }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        style={{
          position: 'relative',
          borderRadius: 24,
          cursor: 'pointer',
          marginTop: stackIndex > 0 ? -168 : 0,
          zIndex: 50 - stackIndex,
          willChange: 'transform',
        }}
      >
        <div style={{
          background: colors.bg,
          border: `1px solid ${colors.accent}28`,
          borderRadius: 24,
          padding: isActive ? '24px 24px 22px' : '24px 24px 20px',
          minHeight: 180,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isActive
            ? `0 20px 60px oklch(0 0 0 / 0.5), 0 0 0 1px ${colors.accent}18`
            : `0 ${6 + stackIndex * 6}px ${20 + stackIndex * 10}px oklch(0 0 0 / 0.35)`,
          transition: 'box-shadow 0.3s ease',
        }}>
          {/* Radial glow */}
          <div style={{
            position: 'absolute', top: -50, right: -30,
            width: 180, height: 180, borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.accent}20 0%, transparent 65%)`,
            pointerEvents: 'none',
          }} />
          {/* Subtle grain overlay */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 24,
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
              <p style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: `${colors.accent}99`, marginBottom: 5,
              }}>Loyalty Card</p>
              <h3 style={{
                fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px',
                color: 'oklch(0.95 0.01 65)', lineHeight: 1.1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{biz.name}</h3>
            </div>
            <div style={{
              flexShrink: 0,
              padding: '5px 11px', borderRadius: 20,
              background: `${colors.accent}1a`,
              border: `1px solid ${colors.accent}35`,
            }}>
              <span style={{
                fontSize: 13, fontWeight: 800, color: colors.accent,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {card.current_stamps}/{biz.max_stamps}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            marginTop: 18, height: 3, borderRadius: 2,
            background: 'oklch(1 0 0 / 0.1)', overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease }}
              style={{ height: '100%', borderRadius: 2, background: colors.accent }}
            />
          </div>

          {/* Expanded */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease }}
                style={{ overflow: 'hidden' }}
              >
                <StampGrid
                  current={card.current_stamps}
                  max={biz.max_stamps}
                  accentColor={colors.accent}
                />

                {isComplete ? (
                  <VoucherCard card={card} onRedeemed={() => onStampsUpdated(card.id, 0)} />
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3, ease }}
                    onClick={e => { e.stopPropagation(); setShowScanner(true) }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', marginTop: 18, padding: '15px',
                      borderRadius: 14, border: 'none',
                      background: colors.accent,
                      color: 'var(--accent-text)',
                      fontWeight: 700, fontSize: 15, cursor: 'pointer',
                      letterSpacing: '-0.1px', fontFamily: 'var(--font-sans)',
                      boxShadow: `0 4px 20px ${colors.accent}40`,
                    }}
                  >
                    Scan QR to Stamp
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed hint */}
          {!isActive && (
            <p style={{
              position: 'absolute', bottom: 18, left: 24,
              fontSize: 11, fontWeight: 500,
              color: 'oklch(1 0 0 / 0.38)',
              letterSpacing: '0.01em',
            }}>
              {isComplete ? '🏆 Free drink ready' : `${stampsLeft} stamp${stampsLeft !== 1 ? 's' : ''} to go`}
            </p>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showScanner && (
          <QRScanner
            card={card}
            onClose={() => setShowScanner(false)}
            onSuccess={newStamps => {
              onStampsUpdated(card.id, newStamps ?? card.current_stamps)
              setShowScanner(false)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
