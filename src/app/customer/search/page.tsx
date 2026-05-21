'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'
import toast from 'react-hot-toast'
import type { Business, LoyaltyCard, LoyaltyCardWithBusiness } from '@/types/database'
import { Search, Plus, Check } from 'lucide-react'
import { getCardColor, CARD_COLORS } from '@/lib/utils'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function SearchPage() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<Business[]>([])
  const [followed, setFollowed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const { cards, setCards }   = useAppStore()

  useEffect(() => {
    setFollowed(new Set(cards.map(c => c.business_id)))
  }, [cards])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('businesses').select('*').ilike('name', `%${q}%`).limit(20)
    setResults(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 300)
    return () => clearTimeout(t)
  }, [query, search])

  async function follow(business: Business) {
    if (followed.has(business.id)) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: cardData, error } = await supabase
      .from('loyalty_cards')
      .insert({ user_id: user.id, business_id: business.id })
      .select('id,user_id,business_id,current_stamps,total_redeemed,created_at')
      .single()
    if (error) { toast.error('Could not follow café'); return }
    const data = cardData as LoyaltyCard
    const card: LoyaltyCardWithBusiness = { ...data, businesses: business }
    setFollowed(prev => new Set([...prev, business.id]))
    useAppStore.getState().setCards([card, ...useAppStore.getState().cards])
    toast.success(`Following ${business.name}`)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '52px 24px 16px', flexShrink: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 16 }}>
            Find cafes
          </h1>
        </motion.div>

        {/* Search input */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease }}
          style={{ position: 'relative' }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute', left: 15, top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search cafes…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '13px 14px 13px 40px',
              borderRadius: 14,
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-soft)',
              color: 'var(--text-primary)', fontSize: 16,
              outline: 'none', fontFamily: 'var(--font-sans)',
              fontWeight: 400, boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.76 0.14 78 / 0.5)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
          {loading && (
            <div style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid var(--border)', borderTopColor: 'var(--accent)',
              animation: 'spin 0.7s linear infinite',
            }} />
          )}
        </motion.div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 48px' }}>

        {/* Empty states */}
        {!loading && !query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{ paddingTop: 32 }}
          >
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 16 }}>
              Popular categories
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Coffee', 'Matcha', 'Bubble Tea', 'Specialty'].map((tag, i) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    animationDelay: `${i * 50}ms`,
                  }}
                >{tag}</button>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && query && results.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 48, fontSize: 14 }}
          >
            No cafes found for "{query}"
          </motion.p>
        )}

        {/* Result list */}
        <AnimatePresence>
          {results.map((biz, i) => {
            const isFollowed = followed.has(biz.id)
            const colors = getCardColor(biz.color)

            return (
              <motion.div
                key={biz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ delay: i * 0.035, duration: 0.3, ease }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 18, marginBottom: 10,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                {/* Color swatch avatar */}
                <div style={{
                  width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                  background: colors.bg,
                  border: `1px solid ${colors.accent}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>☕</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: 700, fontSize: 15, letterSpacing: '-0.2px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{biz.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>
                    {biz.max_stamps} stamps · {biz.voucher_reward ?? 'Free item'}
                  </p>
                </div>

                {/* Follow button */}
                <motion.button
                  onClick={() => follow(biz)}
                  disabled={isFollowed}
                  whileTap={isFollowed ? {} : { scale: 0.92 }}
                  style={{
                    flexShrink: 0, padding: '8px 14px', borderRadius: 10, border: 'none',
                    background: isFollowed
                      ? 'oklch(0.66 0.16 155 / 0.12)'
                      : colors.accent,
                    color: isFollowed ? 'oklch(0.66 0.16 155)' : 'var(--accent-text)',
                    fontWeight: 700, fontSize: 13, cursor: isFollowed ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontFamily: 'var(--font-body)',
                    outline: isFollowed ? '1px solid oklch(0.66 0.16 155 / 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: isFollowed ? 'none' : `0 2px 12px ${colors.accent}35`,
                  }}
                >
                  {isFollowed
                    ? <><Check size={13} /> Following</>
                    : <><Plus size={13} /> Follow</>
                  }
                </motion.button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
