'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import StampBuddyLogo from '@/components/ui/Logo'
import { Phone, Lock, Eye, EyeOff } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function GoogleAuth() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)

  async function signInWithGoogle() {
    const supabase = createClient()
    const redirectUrl = `${window.location.origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    })
    if (error) toast.error(error.message)
  }

  function cleanPhone(num: string): string {
    let clean = num.replace(/\s+/g, '').replace(/-/g, '')
    if (!clean.startsWith('+')) {
      if (clean.startsWith('60')) {
        clean = '+' + clean
      } else if (clean.startsWith('0')) {
        clean = '+60' + clean.substring(1)
      } else {
        clean = '+60' + clean
      }
    }
    return clean
  }

  async function handlePhoneAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) { toast.error('Phone number required'); return }
    if (!pin) { toast.error('PIN required'); return }
    if (!/^\d{4}$/.test(pin)) { toast.error('PIN must be exactly 4 digits'); return }

    setLoading(true)
    const supabase = createClient()
    const cleanedPhone = cleanPhone(phone)
    const email = `${cleanedPhone.replace('+', '')}@stampbuddy.local`

    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pin
      })
      setLoading(false)
      if (error) {
        toast.error(error.message === 'Invalid login credentials' ? 'Invalid Phone Number or PIN' : error.message)
        return
      }
      toast.success('Welcome back!')
      window.location.href = '/'
    } else {
      // Sign Up mode
      if (pin !== confirmPin) {
        setLoading(false)
        toast.error('PINs do not match')
        return
      }

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, pin })
        })
        const result = await res.json()

        if (!res.ok) {
          setLoading(false)
          toast.error(result.error || 'Registration failed')
          return
        }

        // Auto-login on successful backend signup
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password: pin
        })

        setLoading(false)
        if (loginError) {
          toast.error('Registered successfully! Please log in.')
          setAuthMode('login')
          return
        }

        toast.success('Loyalty card wallet created!')
        window.location.href = '/'
      } catch (err: any) {
        setLoading(false)
        toast.error(err.message || 'Registration failed')
      }
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '52px 28px', background: 'var(--bg-base)',
      backgroundImage: `
        linear-gradient(45deg, oklch(0.12 0.015 55) 25%, transparent 25%),
        linear-gradient(-45deg, oklch(0.12 0.015 55) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, oklch(0.12 0.015 55) 75%),
        linear-gradient(-45deg, transparent 75%, oklch(0.12 0.015 55) 75%)
      `,
      backgroundSize: '40px 40px',
      backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, oklch(0.76 0.14 78 / 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        style={{ width: '100%', maxWidth: 420, position: 'relative' }}
      >
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease }}
            style={{ margin: '0 auto 20px', display: 'flex', justifyContent: 'center' }}
          >
            <StampBuddyLogo size={64} />
          </motion.div>

          {/* Ruled divider */}
          <div style={{
            height: 4,
            background: 'var(--accent)',
            width: 80,
            margin: '0 auto 20px',
            borderRadius: 2,
          }} />

          <h1 style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            marginBottom: 8,
            lineHeight: 1,
            textShadow: '0 2px 16px oklch(0 0 0 / 0.3)',
          }}>
            Welcome back
          </h1>
          <p style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '32ch',
            margin: '0 auto',
          }}>
            Sign in to your StampBuddy wallet
          </p>
        </div>

        {/* Google button */}
        <motion.button
          onClick={signInWithGoogle}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', padding: '16px 24px', borderRadius: 60,
            background: 'oklch(0.97 0.004 65)',
            border: '2px solid oklch(0.88 0.012 65)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            fontSize: 15, fontWeight: 700,
            color: 'oklch(0.15 0.02 55)',
            letterSpacing: '0.01em',
            boxShadow: '0 4px 20px oklch(0 0 0 / 0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 28px oklch(0 0 0 / 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px oklch(0 0 0 / 0.2)'
          }}
        >
          <GoogleIcon />
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          margin: '28px 0',
        }}>
          <div style={{ flex: 1, height: 2, background: 'var(--border-soft)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: 2, background: 'var(--border-soft)' }} />
        </div>

        {/* Phone & PIN login form */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '2px solid var(--border-soft)',
          borderRadius: 24,
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}>
          {/* Form Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-base)',
            padding: 4,
            borderRadius: 12,
            border: '1.5px solid var(--border-soft)',
            marginBottom: 24,
          }}>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setPin(''); setConfirmPin('') }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                background: authMode === 'login' ? 'var(--bg-surface)' : 'transparent',
                color: authMode === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: authMode === 'login' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setPin(''); setConfirmPin('') }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                background: authMode === 'signup' ? 'var(--bg-surface)' : 'transparent',
                color: authMode === 'signup' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: authMode === 'signup' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Form Inputs */}
          <form onSubmit={handlePhoneAuth} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  placeholder="e.g. 0123456789"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={loading}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {authMode === 'login' ? '4-Digit PIN' : 'Create 4-Digit PIN'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPin ? 'text' : 'password'}
                  placeholder="••••"
                  maxLength={4}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                  }}
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Confirm 4-Digit PIN
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showPin ? 'text' : 'password'}
                    placeholder="••••"
                    maxLength={4}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    style={{ ...inputStyle, paddingRight: 48 }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                background: 'var(--accent)',
                opacity: loading ? 0.6 : 1,
                color: 'var(--accent-text)', fontWeight: 700, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.1px',
                marginTop: 8,
                boxShadow: loading ? 'none' : `0 4px 16px rgba(0,0,0,0.15)`,
                transition: 'opacity 0.2s',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {loading 
                ? (authMode === 'login' ? 'Logging in…' : 'Creating Wallet…') 
                : (authMode === 'login' ? 'Log In →' : 'Create Wallet →')
              }
            </motion.button>
          </form>
        </div>

        <p style={{
          fontSize: 12, color: 'var(--text-muted)', textAlign: 'center',
          marginTop: 28, lineHeight: 1.6,
        }}>
          By continuing you agree to our terms of service and privacy policy.
        </p>
      </motion.div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px 13px 44px',
  borderRadius: 14,
  fontSize: 16,
  background: 'var(--bg-base)',
  border: '1.5px solid var(--border-soft)',
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-sans)',
  fontWeight: 600,
  transition: 'border-color 0.15s',
  letterSpacing: '0.02em',
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
