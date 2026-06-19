'use client'

import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import StampBuddyLogo from '@/components/ui/Logo'
import { setAuthIntentCookie, type AuthIntent } from '@/lib/auth-intent'
import { getAppOrigin } from '@/lib/app-url'
import { Store, ScanLine } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

interface Props {
  variant: 'merchant' | 'customer'
}

export default function GoogleAuth({ variant }: Props) {
  const isMerchant = variant === 'merchant'
  const intent: AuthIntent = isMerchant ? 'merchant' : 'customer'

  async function signInWithGoogle() {
    setAuthIntentCookie(intent)
    const supabase = createClient()
    const redirectUrl = `${getAppOrigin()}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '52px 28px', background: 'var(--bg-base)',
    }}>
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        style={{ width: '100%', maxWidth: 420, position: 'relative' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease }}
            style={{ margin: '0 auto 20px', display: 'flex', justifyContent: 'center' }}
          >
            <StampBuddyLogo size={64} />
          </motion.div>

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
          }}>
            {isMerchant ? 'Start your free trial' : 'Collect stamps'}
          </h1>
          <p style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '36ch',
            margin: '0 auto',
          }}>
            {isMerchant
              ? 'Sign in with Google to set up your business loyalty program.'
              : 'Sign in with Google to scan merchant QRs and collect rewards.'}
          </p>
        </div>

        <motion.button
          type="button"
          onClick={signInWithGoogle}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '16px 18px',
            borderRadius: 18,
            background: 'var(--bg-elevated)',
            border: '2px solid var(--accent)',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: '0 8px 24px var(--accent-dim)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'var(--accent-dim)',
              border: '1px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              flexShrink: 0,
            }}>
              {isMerchant ? <Store size={20} strokeWidth={2.2} /> : <ScanLine size={20} strokeWidth={2.2} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                marginBottom: 4,
              }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Continue with Google
                </span>
                <GoogleIcon />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                {isMerchant ? 'For business owners' : 'For customers collecting stamps'}
              </p>
            </div>
          </div>
        </motion.button>

        <p style={{
          fontSize: 12, color: 'var(--text-muted)', textAlign: 'center',
          marginTop: 24, lineHeight: 1.6,
        }}>
          By continuing you agree to our terms of service and privacy policy.
        </p>
      </motion.div>
    </div>
  )
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
