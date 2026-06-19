'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'
import type { LoyaltyCard, Business, LoyaltyCardWithBusiness } from '@/types/database'
import QRScanner from '@/components/wallet/QRScanner'
import { LogOut } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function CustomerScanPage() {
  const { profile, setCards } = useAppStore()

  const fetchCards = useCallback(async () => {
    const supabase = createClient()
    const { data: cardsData } = await supabase
      .from('loyalty_cards').select('*').order('created_at', { ascending: false })
    if (!cardsData) return
    const data = cardsData as LoyaltyCard[]
    const bizIds = [...new Set(data.map(c => c.business_id))]
    const { data: bizData } = await supabase.from('businesses').select('*').in('id', bizIds)
    const businesses = (bizData ?? []) as Business[]
    const bizMap = Object.fromEntries(businesses.map(b => [b.id, b]))
    setCards(data.map(c => ({ ...c, businesses: bizMap[c.business_id] })) as LoyaltyCardWithBusiness[])
  }, [setCards])

  useEffect(() => {
    if (profile) return
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) useAppStore.getState().setProfile(data as any)
    })
  }, [profile])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/join'
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>
      <div style={{ padding: '52px 24px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
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
            }}>
              Scan
            </h1>
            <p style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              marginTop: 8,
              maxWidth: 280,
              lineHeight: 1.5,
            }}>
              Point at any merchant QR — stamps land instantly, even if it&apos;s your first visit
            </p>
          </motion.div>
          <motion.button
            onClick={handleSignOut}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'var(--bg-surface)', border: '2px solid var(--border-soft)',
              borderRadius: 14, padding: '10px 16px', cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600,
            }}
          >
            <LogOut size={15} /> Sign out
          </motion.button>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px 32px',
        overflow: 'hidden',
      }}>
        <QRScanner
          variant="embedded"
          mode="unified"
          onSuccess={() => fetchCards()}
        />
      </div>
    </div>
  )
}
