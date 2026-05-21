'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { LoyaltyCardWithBusiness, RedeemVoucherResult } from '@/types/database'

interface Props {
  card: LoyaltyCardWithBusiness
  onRedeemed: () => void
}

const TRACK_W = 272
const THUMB    = 52

export default function VoucherCard({ card, onRedeemed }: Props) {
  const [redeemed, setRedeemed] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft]   = useState('')
  const [loading, setLoading]     = useState(false)
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
      toast.success('Voucher active! Show to cashier.')
      onRedeemed()
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 32 })
    }
  }, [x, maxX, card.id, onRedeemed])

  const reward = card.businesses.voucher_reward ?? 'Free item'

  if (redeemed && expiresAt) {
    const expired = timeLeft === 'Expired'
    return (
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
          <div style={{
            padding: '14px 20px', borderRadius: 14,
            background: 'oklch(0.09 0.012 55)',
            fontVariantNumeric: 'tabular-nums',
            fontSize: 34, fontWeight: 800, letterSpacing: '-1px',
            color: 'oklch(0.76 0.14 155)',
          }}>
            {timeLeft}
          </div>
        )}
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          Screenshots cannot be reused — timer is live
        </p>
      </motion.div>
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
