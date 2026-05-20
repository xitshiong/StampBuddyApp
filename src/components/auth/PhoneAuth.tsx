'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type Step = 'phone' | 'otp' | 'role'

export default function PhoneAuth() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [role, setRole] = useState<'customer' | 'merchant'>('customer')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function sendOtp() {
    if (!phone.match(/^\+\d{8,15}$/)) {
      toast.error('Enter phone with country code, e.g. +601234567890')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('OTP sent')
    setStep('otp')
  }

  async function verifyOtp() {
    setLoading(true)
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    if (error) { setLoading(false); toast.error(error.message); return }

    // Check if profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user!.id)
      .single()

    if (!profile) {
      setLoading(false)
      setStep('role')
      return
    }
    // Profile exists — redirect handled by root page
    window.location.href = '/'
  }

  async function createProfile() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      phone,
      role,
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    window.location.href = '/'
  }

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-base)' }}>
      {/* Logo mark */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 48, textAlign: 'center' }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'oklch(0.65 0.18 260 / 0.15)',
          border: '1px solid oklch(0.65 0.18 260 / 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 32,
        }}>☕</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>StampBuddy</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>Your digital loyalty wallet</p>
      </motion.div>

      <div style={{ width: '100%', maxWidth: 360 }}>
        <AnimatePresence mode="wait">
          {step === 'phone' && (
            <motion.div key="phone" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Phone number</p>
              <input
                type="tel"
                placeholder="+601234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                style={inputStyle}
                autoFocus
              />
              <Btn onClick={sendOtp} loading={loading}>Send OTP</Btn>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div key="otp" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Verification code</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Sent to {phone}</p>
              <input
                type="number"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                style={inputStyle}
                autoFocus
                maxLength={6}
              />
              <Btn onClick={verifyOtp} loading={loading}>Verify</Btn>
              <button onClick={() => setStep('phone')} style={backBtnStyle}>← Change number</button>
            </motion.div>
          )}

          {step === 'role' && (
            <motion.div key="role" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>How will you use StampBuddy?</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>You can't change this later.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {(['customer', 'merchant'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 16,
                      border: `1.5px solid ${role === r ? 'oklch(0.65 0.18 260)' : 'var(--border)'}`,
                      background: role === r ? 'oklch(0.65 0.18 260 / 0.1)' : 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{r === 'customer' ? '☕ Customer' : '🏪 Merchant'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      {r === 'customer' ? 'Collect stamps at your favourite cafes' : 'Run a loyalty program for your business'}
                    </div>
                  </button>
                ))}
              </div>
              <Btn onClick={createProfile} loading={loading}>Get started</Btn>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Btn({ onClick, loading, children }: { onClick: () => void; loading: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%', padding: '16px', borderRadius: 'var(--radius-btn)',
        background: loading ? 'oklch(0.65 0.18 260 / 0.5)' : 'oklch(0.65 0.18 260)',
        color: 'oklch(0.12 0.008 260)', fontWeight: 700, fontSize: 15,
        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        marginTop: 16, transition: 'opacity 0.15s',
      }}
    >
      {loading ? 'Loading…' : children}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', borderRadius: 14,
  background: 'var(--bg-surface)', border: '1.5px solid var(--border)',
  color: 'var(--text-primary)', fontSize: 16, outline: 'none',
  marginBottom: 4, fontFamily: 'var(--font-sans)',
}

const backBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-secondary)',
  fontSize: 13, cursor: 'pointer', marginTop: 12, padding: '4px 0',
}
