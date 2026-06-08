'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { LoyaltyCardWithBusiness, RedeemVoucherResult } from '@/types/database'
import { CheckCircle2, Sparkles, Clock, ExternalLink } from 'lucide-react'

interface Props {
  card: LoyaltyCardWithBusiness
  onRedeemed: (newStamps?: number) => void
}

const TRACK_W = 272
const THUMB    = 52

export default function VoucherCard({ card, onRedeemed }: Props) {
  const [redeemed, setRedeemed] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [showModal, setShowModal] = useState(false)
  const x    = useMotionValue(0)
  const maxX = TRACK_W - THUMB - 8
  const progress     = useTransform(x, [0, maxX], [0, 1])
  const labelOpacity = useTransform(progress, [0, 0.7], [1, 0])
  const thumbBg      = useTransform(progress, [0, 1], ['oklch(0.76 0.14 78)', 'oklch(0.66 0.16 155)'])

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const diff = expiresAt.getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Expired'); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const handleDragEnd = useCallback(async () => {
    if (x.get() >= maxX * 0.85) {
      await animate(x, maxX, { type: 'spring', stiffness: 400, damping: 32 })
      setLoading(true)
      const supabase = createClient()
      const { data: rawData, error } = await supabase.rpc('redeem_voucher', { p_loyalty_card_id: card.id } as any)
      const data = rawData as RedeemVoucherResult | null
      setLoading(false)
      if (error || !data?.ok) {
        toast.error('Redemption failed. Try again.')
        animate(x, 0, { type: 'spring', stiffness: 400, damping: 32 })
        return
      }
      setRedeemed(true)
      setExpiresAt(new Date(data.expires_at as string))
      setShowModal(true)
      toast.success('Voucher active! Show to cashier.')
      onRedeemed(data?.new_stamps)
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 32 })
    }
  }, [x, maxX, card.id, onRedeemed])

  const reward = card.businesses.voucher_reward ?? 'Free item'

  if (redeemed && expiresAt) {
    const expired = timeLeft === 'Expired'
    return (
      <>
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: 20, padding: '22px 20px',
            borderRadius: 18,
            background: expired
              ? 'oklch(0.18 0.015 55)'
              : 'oklch(0.15 0.04 155 / 0.6)',
            border: `1.5px solid ${expired ? 'var(--border)' : 'oklch(0.66 0.16 155 / 0.45)'}`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 38, marginBottom: 10 }}>
            {expired ? '⌛' : '🎉'}
          </div>
          <p style={{
            fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px',
            color: expired ? 'var(--text-muted)' : 'oklch(0.76 0.14 155)',
            marginBottom: 4,
          }}>
            {expired ? 'Voucher Expired' : 'Voucher Active'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.4 }}>
            {expired ? 'Tap Scan QR to earn a new card.' : `Show this screen to redeem: ${reward}`}
          </p>
          {!expired && (
            <>
              <div style={{
                padding: '14px 20px', borderRadius: 14,
                background: 'oklch(0.09 0.012 55)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: 34, fontWeight: 800, letterSpacing: '-1px',
                color: 'oklch(0.76 0.14 155)',
                marginBottom: 16,
              }}>
                {timeLeft}
              </div>
              
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: 'oklch(0.76 0.14 155 / 0.12)',
                  border: '1.5px solid oklch(0.76 0.14 155 / 0.35)',
                  color: 'oklch(0.76 0.14 155)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'oklch(0.76 0.14 155 / 0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'oklch(0.76 0.14 155 / 0.12)'}
              >
                <ExternalLink size={14} /> Show Cashier (Fullscreen)
              </button>
            </>
          )}
          {expired && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Card stamp resets on your next visit scanning QR.
            </p>
          )}
          {!expired && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
              Screenshots cannot be reused — timer is live
            </p>
          )}
        </motion.div>

        {/* Fullscreen Success Overlay Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'oklch(0.08 0.008 260 / 0.94)',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
              }}
            >
              <motion.div
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 30 }}
                transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                style={{
                  width: '100%',
                  maxWidth: 360,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Confetti & Icon Header */}
                <div style={{ position: 'relative', marginBottom: 24 }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: '50%',
                      background: expired
                        ? 'oklch(0.20 0.008 260)'
                        : 'radial-gradient(circle at 35% 35%, oklch(0.66 0.16 155), oklch(0.56 0.18 155))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: expired
                        ? 'none'
                        : '0 12px 36px oklch(0.56 0.18 155 / 0.45)',
                    }}
                  >
                    {expired ? (
                      <span style={{ fontSize: 38 }}>⌛</span>
                    ) : (
                      <CheckCircle2 size={44} color="white" strokeWidth={2.5} />
                    )}
                  </motion.div>
                  
                  {!expired && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      style={{ position: 'absolute', top: -10, right: -10, color: 'oklch(0.85 0.18 90)' }}
                    >
                      <Sparkles size={24} fill="currentColor" />
                    </motion.div>
                  )}
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: 26,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  marginBottom: 8,
                  color: 'white',
                }}>
                  {expired ? 'Voucher Expired' : 'Voucher Active!'}
                </h2>
                
                <p style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  maxWidth: '28ch',
                  marginBottom: 28,
                }}>
                  {expired 
                    ? 'This voucher verification period has expired.'
                    : 'Please show this live screen to the cashier to claim your reward.'
                  }
                </p>

                {/* Reward Box */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  style={{
                    width: '100%',
                    background: 'oklch(0.12 0.015 55)',
                    border: '1.5px solid var(--border-soft)',
                    borderRadius: 20,
                    padding: '20px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    marginBottom: 28,
                  }}
                >
                  <p style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: expired ? 'var(--text-muted)' : 'oklch(0.76 0.14 78)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}>
                    {card.businesses.name}
                  </p>
                  <h3 style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: 'white',
                    letterSpacing: '-0.5px',
                    marginBottom: 16,
                  }}>
                    🎁 {reward}
                  </h3>
                  
                  {/* Large digital countdown */}
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: 14,
                    background: 'oklch(0.08 0.008 260 / 0.6)',
                    border: expired 
                      ? '1.5px solid var(--border-soft)'
                      : '1.5px solid oklch(0.66 0.16 155 / 0.3)',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: 40,
                    fontWeight: 900,
                    letterSpacing: '-1.5px',
                    color: expired ? 'var(--text-muted)' : 'oklch(0.76 0.14 155)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                  }}>
                    <Clock size={24} style={{ opacity: 0.8 }} />
                    <span>{timeLeft}</span>
                  </div>
                </motion.div>

                {/* Security info */}
                <p style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginBottom: 32,
                }}>
                  {expired 
                    ? '⌛ Verification window closed.'
                    : '🛡️ Live timer active. Screenshots are not valid.'
                  }
                </p>

                {/* Dismiss button */}
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 14,
                    background: 'var(--bg-surface)',
                    border: '1.5px solid var(--border-soft)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                >
                  Done
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* Reward banner */}
      <div style={{
        padding: '14px 18px', borderRadius: 14, marginBottom: 14,
        background: 'oklch(0.76 0.14 78 / 0.1)',
        border: '1.5px dashed oklch(0.76 0.14 78 / 0.35)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>🏆</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>
            Card complete!
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{reward}</p>
        </div>
      </div>

      {/* Slide track */}
      <div style={{
        position: 'relative',
        width: TRACK_W, height: THUMB + 8,
        borderRadius: (THUMB + 8) / 2,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-soft)',
        overflow: 'hidden', margin: '0 auto',
      }}>
        <div className="shimmer" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }} />

        <motion.span style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
          opacity: labelOpacity, pointerEvents: 'none', userSelect: 'none',
        }}>
          {loading ? 'Redeeming…' : 'Slide to redeem →'}
        </motion.span>

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: maxX }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{
            x, position: 'absolute', top: 4, left: 4,
            width: THUMB, height: THUMB, borderRadius: '50%',
            background: thumbBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, cursor: 'grab', touchAction: 'none',
            boxShadow: '0 2px 16px oklch(0.76 0.14 78 / 0.35)',
          }}
          whileTap={{ cursor: 'grabbing', scale: 1.06 }}
        >
          🎁
        </motion.div>
      </div>
    </div>
  )
}
