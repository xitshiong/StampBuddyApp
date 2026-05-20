'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { LoyaltyCardWithBusiness, RedeemStampResult } from '@/types/database'

interface Props {
  card: LoyaltyCardWithBusiness
  onClose: () => void
  onSuccess: (newStamps: number) => void
}

export default function QRScanner({ card, onClose, onSuccess }: Props) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const scannerInstance = useRef<unknown>(null)
  const [scanning, setScanning] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function startScanner() {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (!scannerRef.current || !mounted) return
      const scanner = new Html5Qrcode('qr-reader')
      scannerInstance.current = scanner
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            if (!scanning) return
            setScanning(false)
            await scanner.stop()
            await handleScan(decodedText)
          },
          () => {}
        )
      } catch {
        setError('Camera access denied. Please allow camera permissions.')
      }
    }
    startScanner()
    return () => {
      mounted = false
      const s = scannerInstance.current as { stop?: () => Promise<void> } | null
      s?.stop?.().catch(() => {})
    }
  }, [])

  async function handleScan(sessionId: string) {
    const supabase = createClient()
    const { data: rawData, error } = await supabase.rpc('redeem_stamp_session', {
      p_session_id: sessionId,
      p_loyalty_card_id: card.id,
    })
    const data = rawData as RedeemStampResult | null
    if (error || !data?.ok) {
      const msg = data?.error === 'session_expired'
        ? 'QR code expired. Ask merchant to generate a new one.'
        : data?.error === 'session_already_used'
        ? 'This QR code has already been used.'
        : data?.error === 'business_mismatch'
        ? 'Wrong café QR code.'
        : 'Could not redeem stamp. Try again.'
      toast.error(msg)
      onClose()
      return
    }
    const newStamps = data.new_stamps ?? 0
    toast.success(`+${newStamps - card.current_stamps} stamp${newStamps - card.current_stamps !== 1 ? 's' : ''} added!`)
    onSuccess(newStamps)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'oklch(0.08 0.008 260 / 0.96)',
        backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}
      >
        <p style={{ fontSize: 13, color: 'oklch(0.65 0.01 260)', marginBottom: 8 }}>
          {card.businesses.name}
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Scan merchant QR</h2>

        {error ? (
          <div style={{ padding: 24, borderRadius: 16, background: 'oklch(0.20 0.008 260)', color: 'oklch(0.65 0.01 260)', fontSize: 14 }}>
            {error}
          </div>
        ) : (
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
            <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }} />
            {/* Corner guides */}
            {['tl','tr','bl','br'].map(pos => (
              <div key={pos} style={{
                position: 'absolute',
                width: 24, height: 24,
                borderColor: 'oklch(0.65 0.18 260)',
                borderStyle: 'solid',
                borderWidth: 0,
                ...(pos === 'tl' ? { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 } : {}),
                ...(pos === 'tr' ? { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 } : {}),
                ...(pos === 'bl' ? { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 } : {}),
                ...(pos === 'br' ? { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 } : {}),
              }} />
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 24, padding: '14px 32px', borderRadius: 14,
            background: 'oklch(0.20 0.008 260)', border: '1px solid oklch(0.28 0.01 260)',
            color: 'oklch(0.96 0.005 260)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  )
}
