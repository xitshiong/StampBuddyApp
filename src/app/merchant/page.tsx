'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Business } from '@/types/database'
import NumPad from '@/components/merchant/NumPad'
import { LogOut, RefreshCw, Settings, QrCode, Sparkles } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const QR_TTL = 60
const ease   = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function MerchantPage() {
  const searchParams = useSearchParams()
  const [business, setBusiness]   = useState<Business | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stampCount, setStampCount] = useState(0)
  const [timeLeft, setTimeLeft]   = useState(QR_TTL)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      const { data } = await supabase
        .from('businesses').select('*').eq('owner_id', user.id).single()
      if (data) setBusiness(data as any)
      else window.location.href = '/merchant/onboarding'
      setLoading(false)

      // Check if we should show celebration modal
      if (searchParams.get('showQR') === 'true') {
        setShowCelebration(true)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!sessionId) return
    setTimeLeft(QR_TTL)
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); setSessionId(null); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [sessionId])

  async function generateQR(count: number) {
    if (!business) return
    setGenerating(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('stamp_sessions')
      .insert({ business_id: business.id, stamp_count: count } as any)
      .select('id').single()
    setGenerating(false)
    if (error || !data) { toast.error('Failed to generate QR'); return }
    const session = data as { id: string }
    setStampCount(count)
    setSessionId(session.id)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  function downloadBusinessQR() {
    if (!business) return
    const canvas = document.createElement('canvas')
    const svg = document.getElementById('business-qr-svg') as any
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, 512, 512)
      ctx.drawImage(img, 0, 0, 512, 512)
      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${business.name.replace(/\s+/g, '-')}-QR.png`
        a.click()
        URL.revokeObjectURL(url)
      })
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  async function shareBusinessQR() {
    if (!business) return

    // Check if Web Share API is supported
    if (!navigator.share) {
      toast.error('Share not supported on this device')
      downloadBusinessQR()
      return
    }

    const canvas = document.createElement('canvas')
    const svg = document.getElementById('business-qr-svg') as any
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = async () => {
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, 512, 512)
      ctx.drawImage(img, 0, 0, 512, 512)

      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], `${business.name.replace(/\s+/g, '-')}-QR.png`, { type: 'image/png' })

        try {
          await navigator.share({
            files: [file],
            title: `${business.name} - Loyalty Card`,
            text: `Scan this QR to collect stamps at ${business.name}!`
          })
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            toast.error('Failed to share')
          }
        }
      })
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }


  const pct = sessionId ? (timeLeft / QR_TTL) * 100 : 100
  const circ = 2 * Math.PI * 26
  const urgent = timeLeft <= 10

  if (loading) return (
    <div style={{
      display: 'flex',
      height: '100dvh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      backgroundImage: `
        linear-gradient(45deg, oklch(0.12 0.015 55) 25%, transparent 25%),
        linear-gradient(-45deg, oklch(0.12 0.015 55) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, oklch(0.12 0.015 55) 75%),
        linear-gradient(-45deg, transparent 75%, oklch(0.12 0.015 55) 75%)
      `,
      backgroundSize: '40px 40px',
      backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '56px 24px 48px',
      background: 'var(--bg-base)',
      minHeight: '100dvh',
      backgroundImage: `
        linear-gradient(45deg, oklch(0.12 0.015 55) 25%, transparent 25%),
        linear-gradient(-45deg, oklch(0.12 0.015 55) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, oklch(0.12 0.015 55) 75%),
        linear-gradient(-45deg, transparent 75%, oklch(0.12 0.015 55) 75%)
      `,
      backgroundSize: '40px 40px',
      backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 44 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <div style={{
            height: 4,
            background: 'var(--accent)',
            width: 60,
            marginBottom: 16,
            borderRadius: 2,
          }} />
          <h1 style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            textShadow: '0 2px 12px oklch(0 0 0 / 0.2)',
          }}>
            {business?.name ?? 'Dashboard'}
          </h1>
        </motion.div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            onClick={() => window.location.href = '/merchant/qr'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'var(--bg-surface)', border: '2px solid var(--border-soft)',
              borderRadius: 14, padding: '10px 16px', cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600,
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--bg-elevated)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-soft)'
              e.currentTarget.style.background = 'var(--bg-surface)'
            }}
          >
            <QrCode size={15} /> Store QR
          </motion.button>
          <motion.button
            onClick={() => window.location.href = '/merchant/settings'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'var(--bg-surface)', border: '2px solid var(--border-soft)',
              borderRadius: 14, padding: '10px 16px', cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600,
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--bg-elevated)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-soft)'
              e.currentTarget.style.background = 'var(--bg-surface)'
            }}
          >
            <Settings size={15} /> Settings
          </motion.button>
          <motion.button
            onClick={handleSignOut}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'var(--bg-surface)', border: '2px solid var(--border-soft)',
              borderRadius: 14, padding: '10px 16px', cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600,
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--bg-elevated)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-soft)'
              e.currentTarget.style.background = 'var(--bg-surface)'
            }}
          >
            <LogOut size={15} /> Sign out
          </motion.button>
        </div>
      </div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && business && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCelebration(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'oklch(0 0 0 / 0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              zIndex: 100,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-surface)',
                borderRadius: 24,
                padding: '32px 28px',
                maxWidth: 400,
                width: '100%',
                boxShadow: '0 20px 60px oklch(0 0 0 / 0.4)',
                border: '1px solid var(--border-soft)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Confetti background effect */}
              <div style={{
                position: 'absolute',
                top: -50,
                left: -50,
                right: -50,
                bottom: -50,
                background: `radial-gradient(circle at 30% 20%, oklch(0.76 0.14 78 / 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 70% 80%, oklch(0.66 0.16 155 / 0.15) 0%, transparent 50%)`,
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'oklch(0.76 0.14 78)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 8px 24px oklch(0.76 0.14 78 / 0.3)',
                  }}
                >
                  <Sparkles size={32} color="white" />
                </motion.div>

                {/* Title */}
                <h2 style={{
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  textAlign: 'center',
                  marginBottom: 12,
                }}>
                  Your business is live!
                </h2>

                {/* Description */}
                <p style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}>
                  Share your QR code with customers so they can start collecting stamps at <strong>{business.name}</strong>
                </p>

                {/* Mini QR preview */}
                <div style={{
                  background: 'white',
                  padding: 16,
                  borderRadius: 16,
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'center',
                  border: '2px solid oklch(0.88 0.012 65)',
                }}>
                  <QRCodeSVG
                    value={`stampbuddy://follow/${business.id}`}
                    size={120}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* CTA buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={() => {
                      window.location.href = '/merchant/qr'
                      setShowCelebration(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 14,
                      border: 'none',
                      background: 'oklch(0.76 0.14 78)',
                      color: 'white',
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'oklch(0.70 0.14 78)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'oklch(0.76 0.14 78)'}
                  >
                    <QrCode size={16} />
                    View Store QR
                  </button>

                  <button
                    onClick={() => setShowCelebration(false)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 14,
                      border: '2px solid var(--border-soft)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-soft)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {sessionId ? (
          /* ── QR Display ── */
          <motion.div
            key="qr"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
          >
            {/* QR card */}
            <div style={{
              width: '100%', maxWidth: 360,
              padding: '28px 24px',
              borderRadius: 24,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-soft)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
              boxShadow: '0 12px 40px oklch(0 0 0 / 0.35)',
            }}>
              {/* Live badge + stamp count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="live-dot" style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'oklch(0.66 0.16 155)',
                    display: 'block',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'oklch(0.66 0.16 155)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Live
                  </span>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20,
                  background: 'var(--accent-dim)',
                  border: '1px solid oklch(0.76 0.14 78 / 0.25)',
                  fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                }}>
                  {stampCount} stamp{stampCount !== 1 ? 's' : ''}
                </span>
              </div>

              {/* QR code */}
              <div style={{
                padding: 16, borderRadius: 16, background: '#ffffff',
                boxShadow: '0 2px 20px oklch(0 0 0 / 0.25)',
              }}>
                <QRCodeSVG value={sessionId} size={200} level="H" bgColor="#ffffff" fgColor="#0f0e0a" />
              </div>

              {/* Countdown ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <svg width={64} height={64} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                  <circle cx={32} cy={32} r={26} fill="none" stroke="var(--border)" strokeWidth={3.5} />
                  <circle
                    cx={32} cy={32} r={26} fill="none"
                    stroke={urgent ? 'oklch(0.62 0.20 20)' : 'var(--accent)'}
                    strokeWidth={3.5}
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - pct / 100)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                  />
                  <text
                    x={32} y={32}
                    textAnchor="middle" dominantBaseline="central"
                    style={{ transform: 'rotate(90deg)', transformOrigin: '32px 32px' }}
                    fill={urgent ? 'oklch(0.62 0.20 20)' : 'var(--text-primary)'}
                    fontSize={13} fontWeight={800}
                  >
                    {timeLeft}s
                  </text>
                </svg>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', color: urgent ? 'oklch(0.62 0.20 20)' : 'var(--text-primary)' }}>
                    {urgent ? 'Expiring soon!' : `Expires in ${timeLeft}s`}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    One-time scan only
                  </p>
                </div>
              </div>
            </div>

            <motion.button
              onClick={() => setSessionId(null)}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '13px 22px', borderRadius: 14,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-soft)',
                color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              <RefreshCw size={15} /> New QR
            </motion.button>
          </motion.div>
        ) : (
          /* ── NumPad ── */
          <motion.div
            key="numpad"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <p style={{
              fontSize: 14, color: 'var(--text-muted)', marginBottom: 24,
              textAlign: 'center', fontWeight: 500,
            }}>
              Enter stamps to award, then tap ✓
            </p>
            <NumPad onGenerate={generateQR} loading={generating} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
