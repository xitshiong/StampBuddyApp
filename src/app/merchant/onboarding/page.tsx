'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { ChevronLeft } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

const COLORS = [
  { label: 'Amber',   value: 'oklch(0.26 0.08 55)',  accent: 'oklch(0.76 0.14 78)' },
  { label: 'Rose',    value: 'oklch(0.24 0.07 15)',   accent: 'oklch(0.70 0.17 15)' },
  { label: 'Emerald', value: 'oklch(0.22 0.07 155)',  accent: 'oklch(0.66 0.16 155)' },
  { label: 'Indigo',  value: 'oklch(0.22 0.08 260)',  accent: 'oklch(0.65 0.18 260)' },
  { label: 'Violet',  value: 'oklch(0.22 0.08 300)',  accent: 'oklch(0.65 0.17 300)' },
  { label: 'Cyan',    value: 'oklch(0.22 0.07 210)',  accent: 'oklch(0.68 0.15 210)' },
]

// Map bg oklch values to hex for DB storage
const BG_TO_HEX: Record<string, string> = {
  'oklch(0.26 0.08 55)':  '#6366f1',
  'oklch(0.24 0.07 15)':  '#f97316',
  'oklch(0.22 0.07 155)': '#22c55e',
  'oklch(0.22 0.08 260)': '#6366f1',
  'oklch(0.22 0.08 300)': '#a855f7',
  'oklch(0.22 0.07 210)': '#06b6d4',
}

export default function MerchantOnboarding() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [maxStamps, setMaxStamps] = useState(8)
  const [voucherReward, setVoucherReward] = useState('')
  const [colorIndex, setColorIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const selectedColor = COLORS[colorIndex]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Business name required'); return }
    if (!voucherReward.trim()) { toast.error('Voucher reward required'); return }
    if (maxStamps < 1 || maxStamps > 20) { toast.error('Stamps must be 1–20'); return }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }

    const { error } = await supabase.from('businesses').insert({
      owner_id: user.id,
      name: name.trim(),
      description: description.trim() || undefined,
      max_stamps: maxStamps,
      voucher_reward: voucherReward.trim(),
      color: BG_TO_HEX[selectedColor.value] ?? '#6366f1',
    })

    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Business created!')
    router.replace('/merchant')
  }

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '52px 28px 0', flexShrink: 0 }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, marginBottom: 24,
          }}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <p style={{
          fontSize: 13, color: 'var(--text-muted)', marginBottom: 10,
        }}>Step 2 of 2</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>
          Set up your business
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Customers will see this on their loyalty card.
        </p>
      </div>

      {/* Scrollable form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 48px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Live card preview */}
          <motion.div
            animate={{ background: selectedColor.value }}
            transition={{ duration: 0.35 }}
            style={{
              borderRadius: 22,
              background: selectedColor.value,
              border: `1px solid ${selectedColor.accent}25`,
              padding: '22px 22px 20px',
              marginBottom: 28,
              position: 'relative', overflow: 'hidden',
              boxShadow: `0 12px 40px oklch(0 0 0 / 0.35)`,
            }}
          >
            <div style={{
              position: 'absolute', top: -40, right: -20, width: 130, height: 130,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${selectedColor.accent}25 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${selectedColor.accent}aa`, marginBottom: 5 }}>
              Loyalty Card · Preview
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px', color: 'oklch(0.95 0.01 65)' }}>
              {name || 'Your Business'}
            </p>
            {description && (
              <p style={{ fontSize: 12, color: 'oklch(0.7 0.01 65)', marginTop: 3 }}>{description}</p>
            )}
            <div style={{ display: 'flex', gap: 7, marginTop: 18, flexWrap: 'wrap' }}>
              {Array.from({ length: maxStamps }).map((_, i) => (
                <div key={i} style={{
                  width: i < 3 ? 22 : 22, height: 22, borderRadius: '50%',
                  background: i < 3 ? selectedColor.accent : 'oklch(1 0 0 / 0.15)',
                  border: `1.5px solid ${i < 3 ? selectedColor.accent : 'oklch(1 0 0 / 0.25)'}`,
                  flexShrink: 0,
                }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'oklch(0.7 0.01 65)', marginTop: 12, fontWeight: 500 }}>
              🎁 {voucherReward || 'Your reward here'}
            </p>
          </motion.div>

          {/* Business name */}
          <FieldGroup label="Business name" required>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Kopi Kita" maxLength={50}
              style={inputStyle}
            />
          </FieldGroup>

          {/* Description */}
          <FieldGroup label="Short description">
            <input
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Specialty coffee & pastries" maxLength={80}
              style={inputStyle}
            />
          </FieldGroup>

          {/* Voucher reward */}
          <FieldGroup label="Voucher reward" required hint="What customers earn when card is full">
            <input
              value={voucherReward} onChange={e => setVoucherReward(e.target.value)}
              placeholder="e.g. 1 free coffee of your choice" maxLength={80}
              style={inputStyle}
            />
          </FieldGroup>

          {/* Stamps stepper */}
          <FieldGroup label="Stamps per card" hint={`${maxStamps} stamps = 1 voucher`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button type="button" onClick={() => setMaxStamps(s => Math.max(1, s - 1))} style={stepBtn}>−</button>
              <span style={{ fontSize: 32, fontWeight: 700, minWidth: 40, textAlign: 'center', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
                {maxStamps}
              </span>
              <button type="button" onClick={() => setMaxStamps(s => Math.min(20, s + 1))} style={stepBtn}>+</button>
            </div>
          </FieldGroup>

          {/* Card colour */}
          <FieldGroup label="Card colour">
            <div style={{ display: 'flex', gap: 10 }}>
              {COLORS.map((c, i) => (
                <button
                  key={c.value} type="button"
                  onClick={() => setColorIndex(i)}
                  title={c.label}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: c.accent, border: 'none', cursor: 'pointer', flexShrink: 0,
                    outline: colorIndex === i ? `3px solid ${c.accent}` : '3px solid transparent',
                    outlineOffset: 3,
                    transform: colorIndex === i ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.2s, outline 0.15s',
                  }}
                />
              ))}
            </div>
          </FieldGroup>

          {/* Submit */}
          <motion.button
            type="submit" disabled={loading}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', padding: '17px', borderRadius: 16, border: 'none',
              background: loading ? `${selectedColor.accent}60` : selectedColor.accent,
              color: 'var(--accent-text)', fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.2px',
              boxShadow: loading ? 'none' : `0 6px 24px ${selectedColor.accent}35`,
              transition: 'background 0.2s, box-shadow 0.2s',
              marginTop: 8,
            }}
          >
            {loading ? 'Creating…' : 'Create business →'}
          </motion.button>
        </form>
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
