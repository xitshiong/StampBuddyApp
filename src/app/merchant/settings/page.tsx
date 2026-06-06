'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Business, LoyaltyCardWithBusiness } from '@/types/database'
import { ChevronLeft, Save } from 'lucide-react'
import WalletCard from '@/components/wallet/WalletCard'
import ImageUpload from '@/components/merchant/ImageUpload'

export default function MerchantSettings() {
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [maxStamps, setMaxStamps] = useState(8)
  const [voucherReward, setVoucherReward] = useState('')
  
  // Branding state
  const [logoUrl, setLogoUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [cardBgColor, setCardBgColor] = useState('#1c1c1e')
  const [cardAccentColor, setCardAccentColor] = useState('#956afa')
  const [cardPattern, setCardPattern] = useState('')
  const [stampShape, setStampShape] = useState('circle')

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }

      const { data } = await supabase
        .from('businesses').select('*').eq('owner_id', user.id).single()

      if (!data) { window.location.href = '/merchant/onboarding'; return }

      const biz = data as Business
      setBusiness(biz)
      setName(biz.name)
      setDescription(biz.description || '')
      setMaxStamps(biz.max_stamps)
      setVoucherReward(biz.voucher_reward)
      
      setLogoUrl(biz.logo_url || '')
      setBannerUrl(biz.banner_url || '')
      setCardBgColor(biz.card_bg_color || '#1c1c1e')
      setCardAccentColor(biz.card_accent_color || biz.color || '#956afa')
      setCardPattern(biz.card_pattern || '')
      setStampShape(biz.stamp_shape || 'circle')

      setLoading(false)
    }
    init()
  }, [])

  async function handleSave() {
    if (!business) return
    if (!name.trim()) { toast.error('Business name required'); return }
    if (!voucherReward.trim()) { toast.error('Voucher reward required'); return }
    if (maxStamps < 1 || maxStamps > 20) { toast.error('Stamps must be 1–20'); return }

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('businesses')
      .update({
        name: name.trim(),
        description: description.trim() || null,
        max_stamps: maxStamps,
        voucher_reward: voucherReward.trim(),
        color: cardAccentColor, // Keep legacy color in sync with accent
        logo_url: logoUrl.trim() || null,
        banner_url: bannerUrl.trim() || null,
        card_bg_color: cardBgColor,
        card_accent_color: cardAccentColor,
        card_pattern: cardPattern.trim() || null,
        stamp_shape: stampShape,
      } as never)
      .eq('id', business.id)

    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Settings saved!')
    router.push('/merchant')
  }

  if (loading) return (
    <div style={{
      display: 'flex', height: '100dvh', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-base)',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  // Dummy card for live preview
  const previewCard = {
    id: 'preview',
    user_id: 'user',
    business_id: business?.id || 'biz',
    current_stamps: Math.floor(maxStamps * 0.4), // show 40% completion
    total_redeemed: 0,
    created_at: new Date().toISOString(),
    businesses: {
      id: business?.id || 'biz',
      owner_id: 'owner',
      name: name || 'Your Business',
      description: description,
      color: cardAccentColor,
      max_stamps: maxStamps,
      voucher_reward: voucherReward || 'Reward',
      created_at: new Date().toISOString(),
      logo_url: logoUrl,
      banner_url: bannerUrl,
      card_bg_color: cardBgColor,
      card_accent_color: cardAccentColor,
      card_text_color: null,
      card_pattern: cardPattern,
      stamp_shape: stampShape
    }
  } as LoyaltyCardWithBusiness

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '52px 28px 0', flexShrink: 0 }}>
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
          height: 4, background: 'var(--accent)', width: 80,
          marginBottom: 20, borderRadius: 2,
        }} />
        <h1 style={{
          fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 900,
          letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.05,
          textShadow: '0 2px 12px oklch(0 0 0 / 0.2)',
        }}>
          Business Settings
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Update your business details and customize your loyalty card
        </p>
      </div>

      {/* Scrollable form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Live card preview */}
          <div style={{ marginBottom: 40, minHeight: isPreviewExpanded ? 460 : 260, position: 'relative', transition: 'min-height 0.35s ease' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              Live Preview <span style={{ fontWeight: 400, opacity: 0.6, fontSize: 12 }}>— Tap card to preview expanded view</span>
            </p>
            <div style={{ position: 'relative', height: isPreviewExpanded ? 'auto' : 240, width: '100%' }}>
               <WalletCard
                  card={previewCard}
                  isActive={true}
                  isExpanded={isPreviewExpanded}
                  isAnotherExpanded={false}
                  isLifting={false}
                  stackIndex={0}
                  onPointerDown={() => {}}
                  onPointerUp={() => {}}
                  onTap={() => setIsPreviewExpanded(!isPreviewExpanded)}
                  onStampsUpdated={() => {}}
               />
            </div>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Basic Details</h2>

          <FieldGroup label="Business name" required>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kopi Kita" maxLength={50} style={inputStyle} />
          </FieldGroup>

          <FieldGroup label="Short description">
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Specialty coffee & pastries" maxLength={80} style={inputStyle} />
          </FieldGroup>

          <FieldGroup label="Voucher reward" required hint="What customers earn when card is full">
            <input value={voucherReward} onChange={e => setVoucherReward(e.target.value)} placeholder="e.g. 1 free coffee of your choice" maxLength={80} style={inputStyle} />
          </FieldGroup>

          <FieldGroup label="Stamps per card" hint={`${maxStamps} stamps = 1 voucher`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button type="button" onClick={() => setMaxStamps(s => Math.max(1, s - 1))} style={stepBtn}>−</button>
              <span style={{ fontSize: 32, fontWeight: 700, minWidth: 40, textAlign: 'center', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
                {maxStamps}
              </span>
              <button type="button" onClick={() => setMaxStamps(s => Math.min(20, s + 1))} style={stepBtn}>+</button>
            </div>
          </FieldGroup>

          <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 20, marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Card Branding</h2>

          <FieldGroup label="Select Card Theme" hint="Choose from our curated premium themes or customize your colors below">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              {[
                { name: 'Amber', bg: 'oklch(0.26 0.08 55)', accent: 'oklch(0.76 0.14 78)' },
                { name: 'Rose', bg: 'oklch(0.24 0.07 15)', accent: 'oklch(0.70 0.17 15)' },
                { name: 'Emerald', bg: 'oklch(0.22 0.07 155)', accent: 'oklch(0.66 0.16 155)' },
                { name: 'Indigo', bg: 'oklch(0.22 0.08 260)', accent: 'oklch(0.65 0.18 260)' },
                { name: 'Violet', bg: 'oklch(0.22 0.08 300)', accent: 'oklch(0.65 0.17 300)' },
                { name: 'Cyan', bg: 'oklch(0.22 0.07 210)', accent: 'oklch(0.68 0.15 210)' },
                { name: 'Midnight', bg: '#111111', accent: '#956afa' },
                { name: 'Slate', bg: '#1c1c1e', accent: '#38bdf8' },
              ].map(theme => {
                const isActive = cardBgColor === theme.bg && cardAccentColor === theme.accent
                return (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => {
                      setCardBgColor(theme.bg)
                      setCardAccentColor(theme.accent)
                    }}
                    title={theme.name}
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.bg} 50%, ${theme.accent} 50%)`,
                      border: 'none', cursor: 'pointer', flexShrink: 0,
                      outline: isActive ? `3px solid var(--accent)` : '3px solid transparent',
                      outlineOffset: 3,
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s, outline 0.15s',
                    }}
                  />
                )
              })}
            </div>
          </FieldGroup>

          <FieldGroup label="Custom Colors" hint="Tap color circles to fine-tune custom background and accent colors">
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
              {/* Background Color Circle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: '2px solid var(--border-soft)',
                  background: cardBgColor,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <input
                    type="color"
                    value={cardBgColor.startsWith('oklch') ? '#1c1c1e' : cardBgColor}
                    onChange={e => setCardBgColor(e.target.value)}
                    style={{
                      position: 'absolute', top: -10, left: -10,
                      width: 64, height: 64, opacity: 0, cursor: 'pointer'
                    }}
                  />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Card Background</span>
              </label>

              {/* Accent Color Circle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: '2px solid var(--border-soft)',
                  background: cardAccentColor,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <input
                    type="color"
                    value={cardAccentColor.startsWith('oklch') ? '#956afa' : cardAccentColor}
                    onChange={e => setCardAccentColor(e.target.value)}
                    style={{
                      position: 'absolute', top: -10, left: -10,
                      width: 64, height: 64, opacity: 0, cursor: 'pointer'
                    }}
                  />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Card Accent</span>
              </label>
            </div>
          </FieldGroup>

          <FieldGroup label="Business Logo" hint="Upload your store logo (PNG, JPG, SVG - 1:1 ratio recommended)">
            <ImageUpload value={logoUrl} onChange={setLogoUrl} label="Logo" aspectRatio="1/1" placeholderText="Upload Logo" />
          </FieldGroup>

          <FieldGroup label="Store/Product Banner" hint="Upload a photo of your shop or products (16:9 ratio recommended)">
            <ImageUpload value={bannerUrl} onChange={setBannerUrl} label="Banner" aspectRatio="16/9" placeholderText="Upload Banner" />
          </FieldGroup>

          <FieldGroup label="Pattern URL (Optional)" hint="Direct link to a subtle background pattern">
            <input value={cardPattern} onChange={e => setCardPattern(e.target.value)} placeholder="https://example.com/pattern.png" style={inputStyle} />
          </FieldGroup>

          <FieldGroup label="Stamp Shape">
             <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setStampShape('circle')} style={{ ...radioBtn, borderColor: stampShape === 'circle' ? 'var(--accent)' : 'var(--border)', background: stampShape === 'circle' ? 'var(--bg-elevated)' : 'var(--bg-surface)' }}>
                   Circle
                </button>
                <button type="button" onClick={() => setStampShape('star')} style={{ ...radioBtn, borderColor: stampShape === 'star' ? 'var(--accent)' : 'var(--border)', background: stampShape === 'star' ? 'var(--bg-elevated)' : 'var(--bg-surface)' }}>
                   Star
                </button>
             </div>
          </FieldGroup>

          {/* Save button */}
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', padding: '17px', borderRadius: 16, border: 'none',
              background: saving ? `var(--accent)` : 'var(--accent)',
              opacity: saving ? 0.6 : 1,
              color: 'var(--accent-text)', fontWeight: 700, fontSize: 15,
              cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '-0.2px',
              boxShadow: saving ? 'none' : `0 6px 24px rgba(0,0,0,0.2)`,
              transition: 'opacity 0.2s, box-shadow 0.2s',
              marginTop: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Changes'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function FieldGroup({ label, children, required, hint }: {
  label: string, children: React.ReactNode, required?: boolean, hint?: string
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: hint ? 4 : 9 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
          {label}
        </label>
        {required && <span style={{ fontSize: 11, color: 'oklch(0.66 0.16 155)', fontWeight: 600 }}>required</span>}
      </div>
      {hint && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 9 }}>{hint}</p>}
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px', borderRadius: 13, fontSize: 16,
  background: 'var(--bg-surface)', border: '1.5px solid var(--border-soft)',
  color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'var(--font-sans)', fontWeight: 400,
  transition: 'border-color 0.15s',
}

const stepBtn: React.CSSProperties = {
  width: 46, height: 46, borderRadius: 13, fontSize: 22, fontWeight: 400,
  background: 'var(--bg-surface)', border: '1.5px solid var(--border-soft)',
  color: 'var(--text-primary)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-sans)', transition: 'background 0.15s',
}

const radioBtn: React.CSSProperties = {
   flex: 1, padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 600,
   border: '2px solid var(--border)', color: 'var(--text-primary)',
   cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
}
