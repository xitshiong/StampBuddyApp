'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Business } from '@/types/database'
import NumPad from '@/components/merchant/NumPad'
import { LogOut, RefreshCw } from 'lucide-react'

const QR_TTL = 60
const ease   = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function MerchantPage() {
  const [business, setBusiness]   = useState<Business | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stampCount, setStampCount] = useState(0)
  const [timeLeft, setTimeLeft]   = useState(QR_TTL)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      const { data } = await supabase
        .from('businesses').select('*').eq('owner_id', user.id).single()
      if (data) setBusiness(data)
      else window.location.href = '/merchant/onboarding'
      setLoading(false)
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
    setStampCount(count)
    setSessionId(data.id)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const pct = sessionId ? (timeLeft / QR_TTL) * 100 : 100
  const circ = 2 * Math.PI * 26
  const urgent = timeLeft <= 10

  if (loading) return (
    <div style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '56px 24px 48px', background: 'var(--bg-base)', minHeight: '100dvh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>
            {business?.name ?? 'Dashboard'}
          </h1>
        </motion.div>
        <motion.button
          onClick={handleSignOut}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
            borderRadius: 12, padding: '9px 14px', cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500,
          }}
        >
          <LogOut size={14} /> Sign out
        </motion.button>
      </div>

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
