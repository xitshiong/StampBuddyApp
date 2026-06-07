'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { LoyaltyCardWithBusiness, RedeemStampResult } from '@/types/database'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  card?: LoyaltyCardWithBusiness
  onClose: () => void
  onSuccess: (newStamps?: number) => void
  mode?: 'stamp' | 'follow'
}

export default function QRScanner({ card, onClose, onSuccess, mode = 'stamp' }: Props) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const scannerInstance = useRef<unknown>(null)
  const scannedRef = useRef(false)
  const [scanning, setScanning] = useState(true)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successBusiness, setSuccessBusiness] = useState<{ name: string; color: string } | null>(null)

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
            if (scannedRef.current) return
            scannedRef.current = true
            setScanning(false)
            
            // Do NOT call scanner.stop() here. Stopping the video track inside its own 
            // frame processing callback causes a WebKit crash on iOS Safari. 
            // We just process the scan and let the component unmount handle the stop.
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

  async function handleScan(decodedText: string) {
    // Check for business follow QR
    if (decodedText.startsWith('stampbuddy://follow/')) {
      const businessId = decodedText.replace('stampbuddy://follow/', '')
      await followBusiness(businessId)
      return
    }

    // Handle stamp session QR (existing flow)
    if (!card) {
      toast.error('Please scan from a loyalty card')
      onClose()
      return
    }

    const supabase = createClient()
    const { data: rawData, error } = await supabase.rpc('redeem_stamp_session', {
      p_session_id: decodedText,
      p_loyalty_card_id: card.id,
    } as any)
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

  async function followBusiness(businessId: string) {
    const supabase = createClient()

    // Fetch business details
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single() as { data: { id: string; name: string; color: string } | null, error: unknown }

    if (bizError || !business) {
      toast.error('Business not found. Make sure you\'re scanning a StampBuddy QR code')
      onClose()
      return
    }

    // Check if already following
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in')
      onClose()
      return
    }

    const { data: existingCard } = await supabase
      .from('loyalty_cards')
      .select('id')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .single()

    if (existingCard) {
      toast.success(`Already following ${business.name}`)
      onClose()
      return
    }

    // Create new loyalty card
    const { error: insertError } = await supabase
      .from('loyalty_cards')
      .insert({
        user_id: user.id,
        business_id: businessId,
      } as any)

    if (insertError) {
      toast.error('Could not follow business')
      onClose()
      return
    }

    // Show success animation
    setSuccessBusiness({ name: business.name, color: business.color })
    setShowSuccess(true)

    // Auto-close after 2 seconds
    setTimeout(() => {
      onSuccess()
    }, 2000)
  }

  return (
    <>
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
            {mode === 'follow' ? 'Scan to Follow' : card?.businesses.name}
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
            {mode === 'follow' ? 'Scan business QR' : 'Scan merchant QR'}
          </h2>

          {error ? (
            <div style={{ padding: 24, borderRadius: 16, background: 'oklch(0.20 0.008 260)', color: 'oklch(0.65 0.01 260)', fontSize: 14 }}>
              {error}
            </div>
          ) : (
            <>
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
              <p style={{ fontSize: 13, color: 'oklch(0.55 0.01 260)', marginTop: 16, lineHeight: 1.5 }}>
                {mode === 'follow' ? 'Point camera at cafe\'s QR code' : 'Point camera at merchant\'s QR code'}
              </p>
            </>
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

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && successBusiness && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1001,
              background: 'oklch(0 0 0 / 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                textAlign: 'center',
                maxWidth: 320,
              }}
            >
              {/* Success icon with confetti effect */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'oklch(0.66 0.16 155)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 12px 40px oklch(0.66 0.16 155 / 0.4)',
                }}
              >
                <CheckCircle2 size={48} color="white" strokeWidth={2.5} />
              </motion.div>

              {/* Success message */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  marginBottom: 12,
                  color: 'white',
                }}
              >
                Card collected!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: 15,
                  color: 'oklch(0.7 0.01 260)',
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                You're now following <strong style={{ color: 'white' }}>{successBusiness.name}</strong>
              </motion.p>

              {/* Mini card preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                style={{
                  background: successBusiness.color,
                  borderRadius: 16,
                  padding: '16px 18px',
                  border: '1px solid oklch(1 0 0 / 0.15)',
                  boxShadow: '0 8px 24px oklch(0 0 0 / 0.3)',
                }}
              >
                <p style={{ fontSize: 16, fontWeight: 700, color: 'oklch(0.95 0.01 65)', letterSpacing: '-0.3px' }}>
                  {successBusiness.name}
                </p>
                <p style={{ fontSize: 11, color: 'oklch(0.7 0.01 65)', marginTop: 4 }}>
                  Start collecting stamps
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
