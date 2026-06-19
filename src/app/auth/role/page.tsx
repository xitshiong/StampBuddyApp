'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { isAuthIntent } from '@/lib/auth-intent'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

const ROLES = [
  {
    id: 'merchant' as const,
    icon: '🏪',
    title: 'Merchant',
    desc: 'Run a digital loyalty program for your business or service.',
    detail: ['Generate QR stamps', 'Track customers', 'Manage rewards'],
    accent: 'var(--accent)',
    bg: 'var(--accent-dim)',
    border: 'oklch(0.50 0.16 28 / 0.25)',
  },
  {
    id: 'customer' as const,
    icon: '☕',
    title: 'Customer',
    desc: 'Collect stamps at your favourite local spots and redeem rewards.',
    detail: ['Follow spots', 'Scan QR codes', 'Redeem rewards'],
    accent: 'var(--success)',
    bg: 'oklch(0.66 0.16 155 / 0.08)',
    border: 'oklch(0.66 0.16 155 / 0.25)',
  },
]

function RolePageInner() {
  const searchParams = useSearchParams()
  const intentParam = searchParams.get('intent')
  const [role, setRole] = useState<'customer' | 'merchant'>('merchant')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isAuthIntent(intentParam)) {
      setRole(intentParam)
    }
  }, [intentParam])

  async function saveRole() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('profiles') as any).upsert({
      id: user.id,
      phone: user.email ?? user.id,
      role,
    }, { onConflict: 'id' })

    setLoading(false)
    if (error) { toast.error(error.message); return }
    router.replace(role === 'merchant' ? '/merchant/onboarding' : '/customer')
  }

  const selected = ROLES.find(r => r.id === role)!

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            height: 4,
            background: 'var(--accent)',
            width: 80,
            marginBottom: 24,
            borderRadius: 2,
          }} />
          <p style={{
            fontSize: 12, fontWeight: 800, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16,
          }}>Step 1 of 2</p>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 2.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: 16,
            textShadow: '0 2px 16px oklch(0 0 0 / 0.3)',
          }}>
            How will you use<br />StampBuddy?
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This sets up your experience. You can't change it later.
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          {ROLES.map((r, i) => {
            const active = role === r.id
            return (
              <motion.button
                key={r.id}
                onClick={() => setRole(r.id)}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease }}
                whileTap={{ scale: 0.985 }}
                style={{
                  textAlign: 'left', cursor: 'pointer',
                  padding: '26px 24px',
                  borderRadius: 22,
                  background: active ? r.bg : 'var(--bg-surface)',
                  border: `2px solid ${active ? r.border : 'var(--border-soft)'}`,
                  transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: active ? `0 8px 32px ${r.accent}20` : 'none',
                }}
              >
                {/* Selected indicator */}
                {active && (
                  <motion.div
                    layoutId="role-indicator"
                    style={{
                      position: 'absolute', top: 20, right: 20,
                      width: 26, height: 26, borderRadius: '50%',
                      background: r.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 16px ${r.accent}40`,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <svg width="12" height="9" viewBox="0 0 11 8" fill="none">
                      <path d="M1 4L4 7L10 1" stroke="var(--accent-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                    background: active ? `${r.accent}22` : 'var(--bg-elevated)',
                    border: `2px solid ${active ? r.border : 'var(--border-soft)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, transition: 'background 0.2s',
                  }}>
                    {r.icon}
                  </div>
                  <div style={{ flex: 1, paddingRight: 32 }}>
                    <p style={{
                      fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
                      color: 'var(--text-primary)',
                      marginBottom: 6,
                    }}>{r.title}</p>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {r.desc}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                      {r.detail.map(d => (
                        <span key={d} style={{
                          fontSize: 12, fontWeight: 700, padding: '5px 12px',
                          borderRadius: 20,
                          background: active ? `${r.accent}18` : 'var(--bg-elevated)',
                          color: active ? r.accent : 'var(--text-muted)',
                          border: `1.5px solid ${active ? `${r.accent}28` : 'transparent'}`,
                          transition: 'all 0.2s',
                          letterSpacing: '0.01em',
                        }}>{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* CTA */}
        <motion.button
          onClick={saveRole}
          disabled={loading}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.4, ease }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', marginTop: 32, padding: '19px',
            borderRadius: 60, border: 'none',
            background: loading ? `${selected.accent}70` : selected.accent,
            color: 'var(--accent-text)', fontWeight: 700, fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.01em',
            boxShadow: loading ? 'none' : `0 8px 32px ${selected.accent}40`,
            transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 12px 40px ${selected.accent}50`
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = `0 8px 32px ${selected.accent}40`
          }}
        >
          {loading ? 'Setting up…' : `Continue as ${selected.title}`}
        </motion.button>

        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginTop: 20,
          lineHeight: 1.6,
        }}>
          Collecting stamps?{' '}
          <Link href="/auth?intent=customer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>
            Continue as a customer
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function RolePage() {
  return (
    <Suspense>
      <RolePageInner />
    </Suspense>
  )
}
