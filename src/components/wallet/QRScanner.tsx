'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { LoyaltyCardWithBusiness, RedeemStampResult } from '@/types/database'
import { CheckCircle2 } from 'lucide-react'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface Props {
  card?: LoyaltyCardWithBusiness
  onClose?: () => void
  onSuccess: (newStamps?: number) => void
  mode?: 'stamp' | 'follow' | 'unified'
  variant?: 'modal' | 'embedded'
}

type SuccessState = {
  type: 'follow' | 'stamp'
  businessName: string
  color: string
  stampsAdded?: number
  newStamps?: number
}

export default function QRScanner({
  card,
  onClose,
  onSuccess,
  mode = 'unified',
  variant = 'modal',
}: Props) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const scannerInstance = useRef<unknown>(null)
  const scannedRef = useRef(false)
  const [scanning, setScanning] = useState(true)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successState, setSuccessState] = useState<SuccessState | null>(null)

  const isEmbedded = variant === 'embedded'
  const isUnified = mode === 'unified' || mode === 'follow'

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

  function resetForNextScan() {
    scannedRef.current = false
    setScanning(true)
  }

  function finishWithError(message: string) {
    toast.error(message)
    if (isEmbedded) {
      resetForNextScan()
    } else {
      onClose?.()
    }
  }

  function showSuccessAnimation(state: SuccessState, newStamps?: number) {
    setSuccessState(state)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setSuccessState(null)
      onSuccess(newStamps)
      if (isEmbedded) resetForNextScan()
      else onClose?.()
    }, 2200)
  }

  async function handleScan(decodedText: string) {
    if (decodedText.startsWith('stampbuddy://follow/')) {
      const businessId = decodedText.replace('stampbuddy://follow/', '')
      await followBusiness(businessId)
      return
    }

    if (isUnified && isSessionId(decodedText)) {
      await redeemStampSession(decodedText.trim())
      return
    }

    if (!card) {
      finishWithError('Unrecognized QR code. Scan a StampBuddy business or stamp QR.')
      return
    }

    await redeemStampSession(decodedText.trim(), card.id, card)
  }

  function isSessionId(text: string) {
    return UUID_RE.test(text)
  }

  async function getOrCreateCard(userId: string, businessId: string): Promise<string | null> {
    const supabase = createClient()

    const { data: existingCard } = await supabase
      .from('loyalty_cards')
      .select('id')
      .eq('user_id', userId)
      .eq('business_id', businessId)
      .maybeSingle() as { data: { id: string } | null }

    if (existingCard) return existingCard.id

    const { data: newCard, error: insertError } = await supabase
      .from('loyalty_cards')
      .insert({ user_id: userId, business_id: businessId } as any)
      .select('id')
      .single() as { data: { id: string } | null; error: unknown }

    if (insertError || !newCard) return null
    return newCard.id
  }

  async function redeemStampSession(
    sessionId: string,
    loyaltyCardId?: string,
    knownCard?: LoyaltyCardWithBusiness,
  ) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      finishWithError('Please sign in')
      return
    }

    let cardId = loyaltyCardId ?? knownCard?.id
    let businessName = knownCard?.businesses.name
    let businessColor = knownCard?.businesses.color ?? 'var(--accent)'
    let priorStamps = knownCard?.current_stamps ?? 0
    let createdCard = false

    if (!cardId) {
      const { data: session } = await supabase
        .from('stamp_sessions')
        .select('business_id')
        .eq('id', sessionId)
        .eq('status', 'pending')
        .maybeSingle() as { data: { business_id: string } | null }

      if (!session) {
        finishWithError('Invalid or expired QR code. Ask the merchant for a new one.')
        return
      }

      const { data: business } = await supabase
        .from('businesses')
        .select('name, color')
        .eq('id', session.business_id)
        .single() as { data: { name: string; color: string } | null }

      if (!business) {
        finishWithError('Business not found')
        return
      }

      businessName = business.name
      businessColor = business.color

      const { data: existingCard } = await supabase
        .from('loyalty_cards')
        .select('id, current_stamps')
        .eq('user_id', user.id)
        .eq('business_id', session.business_id)
        .maybeSingle() as { data: { id: string; current_stamps: number } | null }

      if (existingCard) {
        cardId = existingCard.id
        priorStamps = existingCard.current_stamps
      } else {
        const newId = await getOrCreateCard(user.id, session.business_id)
        if (!newId) {
          finishWithError('Could not add loyalty card')
          return
        }
        cardId = newId
        createdCard = true
        priorStamps = 0
      }
    }

    const { data: rawData, error } = await supabase.rpc('redeem_stamp_session', {
      p_session_id: sessionId,
      p_loyalty_card_id: cardId,
    } as any)
    const data = rawData as RedeemStampResult | null

    if (error || !data?.ok) {
      const msg = data?.error === 'session_expired'
        ? 'QR code expired. Ask merchant to generate a new one.'
        : data?.error === 'session_already_used'
        ? 'This QR code has already been used.'
        : data?.error === 'business_mismatch'
        ? 'Wrong business QR code.'
        : 'Could not redeem stamp. Try again.'
      finishWithError(msg)
      return
    }

    const newStamps = data.new_stamps ?? priorStamps
    const stampsAdded = newStamps - priorStamps

    if (createdCard) {
      showSuccessAnimation({
        type: 'stamp',
        businessName: businessName ?? 'Business',
        color: businessColor,
        stampsAdded,
        newStamps,
      }, newStamps)
      return
    }

    toast.success(`+${stampsAdded} stamp${stampsAdded !== 1 ? 's' : ''} added!`)
    onSuccess(newStamps)
    if (isEmbedded) resetForNextScan()
    else onClose?.()
  }

  async function followBusiness(businessId: string) {
    const supabase = createClient()

    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single() as { data: { id: string; name: string; color: string } | null, error: unknown }

    if (bizError || !business) {
      finishWithError('Business not found. Make sure you\'re scanning a StampBuddy QR code')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      finishWithError('Please sign in')
      return
    }

    const { data: existingCard } = await supabase
      .from('loyalty_cards')
      .select('id')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .maybeSingle() as { data: { id: string } | null }

    if (existingCard) {
      toast.success(`Already following ${business.name}`)
      if (isEmbedded) resetForNextScan()
      else onClose?.()
      return
    }

    const { error: insertError } = await supabase
      .from('loyalty_cards')
      .insert({
        user_id: user.id,
        business_id: businessId,
      } as any)

    if (insertError) {
      finishWithError('Could not follow business')
      return
    }

    showSuccessAnimation({
      type: 'follow',
      businessName: business.name,
      color: business.color,
    })
  }

  const heading = mode === 'follow'
    ? 'Scan business QR'
    : mode === 'stamp'
    ? 'Scan merchant QR'
    : 'Scan QR code'

  const subheading = mode === 'follow'
    ? 'Scan to Follow'
    : mode === 'stamp'
    ? card?.businesses.name
    : 'Stamp or store QR'

  const hint = mode === 'unified'
    ? 'Point at the merchant\'s screen — stamp QR or store QR'
    : mode === 'follow'
    ? 'Point camera at business\'s QR code'
    : 'Point camera at merchant\'s QR code'

  const scannerContent = (
    <>
      {!isEmbedded && (
        <>
          <p style={{ fontSize: 13, color: 'oklch(0.85 0.02 80)', marginBottom: 8 }}>
            {subheading}
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: 'var(--accent-text)' }}>
            {heading}
          </h2>
        </>
      )}

      {error ? (
        <div style={{
          padding: 24,
          borderRadius: 16,
          background: isEmbedded ? 'var(--bg-surface)' : 'var(--bg-elevated)',
          color: 'var(--text-secondary)',
          fontSize: 14,
          border: isEmbedded ? '1px solid var(--border-soft)' : undefined,
        }}>
          {error}
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
            <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }} />
            {['tl', 'tr', 'bl', 'br'].map(pos => (
              <div key={pos} style={{
                position: 'absolute',
                width: 24, height: 24,
                borderColor: 'var(--accent)',
                borderStyle: 'solid',
                borderWidth: 0,
                ...(pos === 'tl' ? { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 } : {}),
                ...(pos === 'tr' ? { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 } : {}),
                ...(pos === 'bl' ? { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 } : {}),
                ...(pos === 'br' ? { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 } : {}),
              }} />
            ))}
          </div>
          <p style={{
            fontSize: 13,
            color: isEmbedded ? 'var(--text-muted)' : 'oklch(0.78 0.02 75)',
            marginTop: 16,
            lineHeight: 1.5,
          }}>
            {hint}
          </p>
          {!scanning && isEmbedded && (
            <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 8, fontWeight: 600 }}>
              Processing…
            </p>
          )}
        </>
      )}

      {!isEmbedded && onClose && (
        <button
          onClick={onClose}
          style={{
            marginTop: 24, padding: '14px 32px', borderRadius: 14,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)',
            color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      )}
    </>
  )

  return (
    <>
      {isEmbedded ? (
        <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
          {scannerContent}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'color-mix(in oklch, var(--text-primary) 94%, transparent)',
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
            {scannerContent}
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {showSuccess && successState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1001,
              background: 'color-mix(in oklch, var(--text-primary) 88%, transparent)',
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
              style={{ textAlign: 'center', maxWidth: 320 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 12px 40px oklch(0.66 0.16 155 / 0.4)',
                }}
              >
                <CheckCircle2 size={48} color="white" strokeWidth={2.5} />
              </motion.div>

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
                {successState.type === 'follow' ? 'Card collected!' : 'Stamps added!'}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: 15,
                  color: 'oklch(0.78 0.02 75)',
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                {successState.type === 'follow' ? (
                  <>You&apos;re now following <strong style={{ color: 'white' }}>{successState.businessName}</strong></>
                ) : (
                  <>
                    <strong style={{ color: 'white' }}>+{successState.stampsAdded}</strong> stamp{successState.stampsAdded !== 1 ? 's' : ''} at{' '}
                    <strong style={{ color: 'white' }}>{successState.businessName}</strong>
                  </>
                )}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                style={{
                  background: successState.color,
                  borderRadius: 16,
                  padding: '16px 18px',
                  border: '1px solid oklch(1 0 0 / 0.15)',
                  boxShadow: '0 8px 24px var(--shadow-mid)',
                }}
              >
                <p style={{ fontSize: 16, fontWeight: 700, color: 'oklch(0.95 0.01 65)', letterSpacing: '-0.3px' }}>
                  {successState.businessName}
                </p>
                <p style={{ fontSize: 11, color: 'oklch(0.7 0.01 65)', marginTop: 4 }}>
                  {successState.type === 'follow'
                    ? 'Start collecting stamps'
                    : `${successState.newStamps} stamps on your card`}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
