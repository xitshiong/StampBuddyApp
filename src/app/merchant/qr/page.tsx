'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Business } from '@/types/database'
import { ChevronLeft, Download, Share2 } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function MerchantQRPage() {
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }

      const { data } = await supabase
        .from('businesses').select('*').eq('owner_id', user.id).single()

      if (!data) { window.location.href = '/merchant/onboarding'; return }

      setBusiness(data as Business)
      setLoading(false)
    }
    init()
  }, [])

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

  if (loading) return (
    <div style={{
      display: 'flex',
      height: '100dvh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      padding: '52px 24px 48px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => router.push('/merchant')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--text-secondary)', fontSize: 15, fontWeight: 600, marginBottom: 28,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ChevronLeft size={20} /> Back to Dashboard
        </button>
        <div style={{
          height: 4,
          background: 'var(--accent)',
          width: 80,
          marginBottom: 20,
          borderRadius: 2,
        }} />
        <h1 style={{
          fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          marginBottom: 12,
          lineHeight: 1.05,
          textShadow: '0 2px 12px oklch(0 0 0 / 0.2)',
        }}>
          Store QR Code
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Share this QR with customers to let them collect your loyalty card
        </p>
      </div>

      {/* Business QR Card */}
      {business && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease }}
          style={{
            width: '100%', maxWidth: 400,
            margin: '0 auto',
            padding: '32px 28px',
            borderRadius: 24,
            background: 'oklch(0.97 0.004 65)',
            border: '2px solid oklch(0.88 0.012 65)',
            boxShadow: '0 12px 40px oklch(0 0 0 / 0.2)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{
              fontSize: 13, fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'oklch(0.4 0.02 55)', marginBottom: 8,
            }}>
              Customer Sign-Up QR
            </p>
            <p style={{ fontSize: 14, color: 'oklch(0.5 0.02 55)', lineHeight: 1.6 }}>
              Customers scan this to follow your business and start collecting stamps
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 20,
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'center',
            boxShadow: '0 4px 16px oklch(0 0 0 / 0.1)',
          }}>
            <QRCodeSVG
              id="business-qr-svg"
              value={`stampbuddy://follow/${business.id}`}
              size={240}
              level="H"
              includeMargin={false}
            />
          </div>

          <p style={{
            fontSize: 17, fontWeight: 700, color: 'oklch(0.2 0.02 55)',
            textAlign: 'center', marginBottom: 24,
          }}>
            {business.name}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={shareBusinessQR}
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
                transition: 'background 0.2s, transform 0.2s',
                boxShadow: '0 4px 16px oklch(0.76 0.14 78 / 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'oklch(0.70 0.14 78)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'oklch(0.76 0.14 78)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <Share2 size={16} />
              Share QR Code
            </button>

            <button
              onClick={downloadBusinessQR}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                border: '2px solid oklch(0.88 0.012 65)',
                background: 'white',
                color: 'oklch(0.2 0.02 55)',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'oklch(0.95 0.004 65)'
                e.currentTarget.style.borderColor = 'oklch(0.76 0.14 78)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = 'oklch(0.88 0.012 65)'
              }}
            >
              <Download size={16} />
              Download QR Code
            </button>
          </div>
        </motion.div>
      )}

      {/* Tips section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease }}
        style={{
          maxWidth: 400,
          margin: '32px auto 0',
          padding: '20px 24px',
          borderRadius: 16,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-soft)',
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          💡 Tips for sharing
        </p>
        <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
          <li>Print and display at your counter or entrance</li>
          <li>Share on social media to reach more customers</li>
          <li>Add to your website or email signature</li>
          <li>Include in receipts or packaging</li>
        </ul>
      </motion.div>
    </div>
  )
}
