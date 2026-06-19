'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import WalletCard from '@/components/wallet/WalletCard'
import type { LoyaltyCardWithBusiness } from '@/types/database'

const smoothEase = [0.16, 1, 0.3, 1] as [number, number, number, number]

const SAMPLE_CARD: LoyaltyCardWithBusiness = {
  id: 'landing-sample',
  user_id: 'sample',
  business_id: 'sample-biz',
  current_stamps: 3,
  total_redeemed: 0,
  created_at: new Date().toISOString(),
  businesses: {
    id: 'sample-biz',
    owner_id: 'sample',
    name: 'Morning Brew',
    description: 'Specialty coffee & pastries',
    color: 'oklch(0.50 0.16 28)',
    max_stamps: 8,
    voucher_reward: 'Free drink',
    created_at: new Date().toISOString(),
    logo_url: null,
    banner_url: '/coffee-banner.jpg',
    card_bg_color: 'oklch(0.92 0.022 78)',
    card_accent_color: 'oklch(0.50 0.16 28)',
    card_text_color: 'oklch(0.22 0.035 42)',
    card_pattern: null,
    stamp_shape: 'circle',
  },
}

export default function LandingCardSample() {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      transition={{ duration: 0.45, ease: smoothEase }}
      style={{
        width: 'min(90vw, 420px)',
        padding: 8,
        borderRadius: 20,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-soft)',
        boxShadow: '0 20px 48px var(--shadow-mid)',
        overflow: 'hidden',
      }}
    >
      <WalletCard
        card={SAMPLE_CARD}
        isActive
        isExpanded={expanded}
        isAnotherExpanded={false}
        isLifting={false}
        stackIndex={0}
        onPointerDown={() => {}}
        onPointerUp={() => {}}
        onTap={() => setExpanded(e => !e)}
        preview
        onStampsUpdated={() => {}}
      />
      <motion.p
        layout
        style={{
          marginTop: 12,
          marginBottom: 4,
          fontSize: 12,
          color: 'var(--text-muted)',
          textAlign: 'center',
          fontWeight: 600,
        }}
      >
        Tap to {expanded ? 'collapse' : 'expand'} preview
      </motion.p>
    </motion.div>
  )
}
