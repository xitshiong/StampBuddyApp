'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

const ROLES = [
  {
    id: 'customer' as const,
    icon: '☕',
    title: 'Customer',
    desc: 'Collect stamps at your favourite cafes and redeem free drinks.',
    detail: ['Follow cafes', 'Scan QR codes', 'Redeem rewards'],
    accent: 'oklch(0.76 0.14 78)',
    bg: 'oklch(0.76 0.14 78 / 0.08)',
    border: 'oklch(0.76 0.14 78 / 0.25)',
  },
  {
    id: 'merchant' as const,
    icon: '🏪',
    title: 'Merchant',
    desc: 'Run a digital loyalty program for your cafe or business.',
    detail: ['Generate QR stamps', 'Track customers', 'Manage rewards'],
    accent: 'oklch(0.66 0.16 155)',
    bg: 'oklch(0.66 0.16 155 / 0.08)',
    border: 'oklch(0.66 0.16 155 / 0.25)',
  },
]

export default function RolePage() {
  const [role, setRole] = useState<'customer' | 'merchant'>('customer')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function saveRole() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }

    const { error } = await supabase.from('profiles').upsert({
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
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      padding: '52px 28px 40px', background: 'var(--bg-base)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
          }}>Step 1 of 2</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.6px', lineHeight: 1.1, marginBottom: 10 }}>
            How will you use<br />StampBuddy?
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            This sets up your experience. You can't change it later.
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
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
                  padding: '22px 22px',
                  borderRadius: 20,
                  background: active ? r.bg : 'var(--bg-surface)',
                  border: `1.5px solid ${active ? r.border : 'var(--border-soft)'}`,
                  transition: 'background 0.2s, border-color 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Selected indicator */}
                {active && (
                  <motion.div
                    layoutId="role-indicator"
                    style={{
                      position: 'absolute', top: 18, right: 18,
                      width: 22, height: 22, borderRadius: '50%',
                      background: r.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                      <path d="M1 4L4 7L10 1" stroke="oklch(0.09 0.012 55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: active ? `${r.accent}22` : 'var(--bg-elevated)',
                    border: `1px solid ${active ? r.border : 'var(--border-soft)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, transition: 'background 0.2s',
                  }}>
                    {r.icon}
                  </div>
                  <div style={{ flex: 1, paddingRight: 28 }}>
                    <p style={{
                      fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px',
                      color: active ? 'var(--text-primary)' : 'var(--text-primary)',
                      marginBottom: 5,
                    }}>{r.title}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {r.desc}
                    </p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                      {r.detail.map(d => (
                        <span key={d} style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 9px',
                          borderRadius: 20,
                          background: active ? `${r.accent}18` : 'var(--bg-elevated)',
                          color: active ? r.accent : 'var(--text-muted)',
                          border: `1px solid ${active ? `${r.accent}28` : 'transparent'}`,
                          transition: 'all 0.2s',
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
            width: '100%', marginTop: 28, padding: '17px',
            borderRadius: 16, border: 'none',
            background: loading ? `${selected.accent}70` : selected.accent,
            color: 'var(--accent-text)', fontWeight: 700, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '-0.2px',
            boxShadow: loading ? 'none' : `0 6px 24px ${selected.accent}35`,
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
        >
          {loading ? 'Setting up…' : `Continue as ${selected.title}`}
        </motion.button>
      </motion.div>
    </div>
  )
}
