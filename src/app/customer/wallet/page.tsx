'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'
import type { LoyaltyCardWithBusiness, LoyaltyCard, Business } from '@/types/database'
import WalletCard from '@/components/wallet/WalletCard'
import { LogOut } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function CustomerWalletPage() {
  const { profile, cards, setCards } = useAppStore()
  const [activeIndex, setActiveIndex] = useState(0)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
  const [liftingCardId, setLiftingCardId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
    setLoading(false)
  }, [setCards])

  useEffect(() => { fetchCards() }, [fetchCards])

  useEffect(() => {
    if (profile) return
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) useAppStore.getState().setProfile(data as any)
    })
  }, [profile])

  function handleStampsUpdated(cardId: string, newStamps: number) {
    useAppStore.getState().updateCardStamps(cardId, newStamps)
  }

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
      <div style={{ padding: '52px 24px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
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
              {loading ? 'Loading…' : 'Your wallet'}
            </h1>
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

        {!loading && cards.length > 0 && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
            Tap a card to view stamps or redeem rewards
          </p>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 48px', WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <Spinner />
          </div>
        ) : cards.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={`wallet-stack ${liftingCardId !== null ? 'is-active' : ''}`} style={{ position: 'relative', minHeight: expandedCardId ? undefined : 400, marginTop: expandedCardId ? 0 : 20 }}>
            <AnimatePresence mode="popLayout">
              {cards.slice(0, 3).map((card, i) => (
                <WalletCard
                  key={card.id}
                  card={card}
                  isActive={i === activeIndex}
                  isExpanded={expandedCardId === card.id}
                  isAnotherExpanded={expandedCardId !== null && expandedCardId !== card.id}
                  isLifting={liftingCardId === card.id}
                  stackIndex={i}
                  onPointerDown={() => setLiftingCardId(card.id)}
                  onPointerUp={() => setLiftingCardId(null)}
                  onTap={() => {
                     if (expandedCardId === card.id) {
                         setExpandedCardId(null)
                         setActiveIndex(0)
                     } else {
                         const newCards = [...cards]
                         const tapped = newCards.splice(i, 1)[0]
                         newCards.unshift(tapped)
                         setCards(newCards)
                         setActiveIndex(0)
                         setExpandedCardId(tapped.id)
                     }
                  }}
                  onStampsUpdated={handleStampsUpdated}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ textAlign: 'center', paddingTop: 72, paddingBottom: 32 }}
    >
      <div style={{
        width: 88, height: 88, borderRadius: 26, margin: '0 auto 24px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40,
      }}>🎫</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 10 }}>
        No loyalty cards yet
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
        Go to the Scan tab and point your camera at a merchant&apos;s QR code to get started
      </p>
    </motion.div>
  )
}

function Spinner() {
  return (
    <>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '2.5px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
