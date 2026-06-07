'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { ChevronLeft, Store, Gift, Palette, Check } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

const COLORS = [
  { label: 'Amber',   value: 'oklch(0.26 0.08 55)',  accent: 'oklch(0.76 0.14 78)' },
  { label: 'Rose',    value: 'oklch(0.24 0.07 15)',   accent: 'oklch(0.70 0.17 15)' },
  { label: 'Emerald', value: 'oklch(0.22 0.07 155)',  accent: 'oklch(0.66 0.16 155)' },
  { label: 'Indigo',  value: 'oklch(0.22 0.08 260)',  accent: 'oklch(0.65 0.18 260)' },
  { label: 'Violet',  value: 'oklch(0.22 0.08 300)',  accent: 'oklch(0.65 0.17 300)' },
  { label: 'Cyan',    value: 'oklch(0.22 0.07 210)',  accent: 'oklch(0.68 0.15 210)' },
]

const BG_TO_HEX: Record<string, string> = {
  'oklch(0.26 0.08 55)':  '#f59e0b',
  'oklch(0.24 0.07 15)':  '#f97316',
  'oklch(0.22 0.07 155)': '#22c55e',
  'oklch(0.22 0.08 260)': '#6366f1',
  'oklch(0.22 0.08 300)': '#a855f7',
  'oklch(0.22 0.07 210)': '#06b6d4',
}

const STEPS = [
  { id: 'identity', label: 'Identity', icon: Store,   title: 'Name your business',       sub: 'How customers will know you' },
  { id: 'loyalty',  label: 'Loyalty',  icon: Gift,    title: 'Set up your loyalty card', sub: 'Stamps needed and the reward' },
  { id: 'style',    label: 'Style',    icon: Palette, title: 'Pick a card colour',       sub: 'Your card will appear in their wallet' },
]

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-60%' : '60%',
    opacity: 0,
    transition: { duration: 0.28, ease },
  }),
}

export default function MerchantOnboarding() {
  const [step, setStep]               = useState(0)
  const [direction, setDirection]     = useState(1)
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [maxStamps, setMaxStamps]     = useState(8)
  const [voucherReward, setVoucherReward] = useState('')
  const [colorIndex, setColorIndex]   = useState(0)
  const [loading, setLoading]         = useState(false)
  const router = useRouter()

  const selectedColor = COLORS[colorIndex]

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  function handleNext() {
    if (step === 0 && !name.trim()) { toast.error('Business name required'); return }
    if (step === 1 && !voucherReward.trim()) { toast.error('Voucher reward required'); return }
    if (step < STEPS.length - 1) goTo(step + 1)
  }

  function handleBack() {
    if (step === 0) router.push('/auth/role')
    else goTo(step - 1)
  }

  async function handleSubmit() {
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
      card_bg_color: selectedColor.value,
      card_accent_color: selectedColor.accent,
    } as any)

    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Business created!')
    router.replace('/merchant?showQR=true')
  }

  const isLastStep = step === STEPS.length - 1

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top bar: back + step progress */}
      <div style={{ padding: '52px 28px 0', flexShrink: 0 }}>
        <button
          onClick={handleBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--text-secondary)', fontSize: 15, fontWeight: 600,
            marginBottom: 32, transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ChevronLeft size={20} /> Back
        </button>

        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
          {STEPS.map((s, i) => {
            const done    = i < step
            const active  = i === step
            const Icon    = s.icon
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                {/* Dot */}
                <motion.button
                  onClick={() => i < step && goTo(i)}
                  disabled={i > step}
                  aria-label={s.label}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, position: 'relative', cursor: i < step ? 'pointer' : 'default',
                    background: done
                      ? selectedColor.accent
                      : active
                        ? 'var(--bg-elevated)'
                        : 'var(--bg-surface)',
                    transition: 'background 0.3s',
                  }}
                  animate={{
                    boxShadow: active
                      ? `0 0 0 2px ${selectedColor.accent}`
                      : '0 0 0 2px transparent',
                  }}
                  transition={{ duration: 0.25 }}
                >
                  {done
                    ? <Check size={15} strokeWidth={2.5} color="var(--accent-text)" />
                    : <Icon size={15} strokeWidth={2} color={active ? selectedColor.accent : 'var(--text-muted)'} />
                  }
                </motion.button>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, margin: '0 6px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 1, overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <motion.div
                      style={{
                        position: 'absolute', inset: 0,
                        background: selectedColor.accent,
                        transformOrigin: 'left center',
                      }}
                      animate={{ scaleX: i < step ? 1 : 0 }}
                      transition={{ duration: 0.4, ease }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Heading — slide with step */}
        <div style={{ position: 'relative', height: 72, overflow: 'hidden' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ position: 'absolute', width: '100%' }}
            >
              <h1 style={{
                fontSize: 'clamp(1.6rem, 5vw, 2.1rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                marginBottom: 6,
              }}>
                {STEPS[step].title}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {STEPS[step].sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Scrollable step body */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px 28px 0' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 0 && (
              <StepIdentity
                name={name} setName={setName}
                description={description} setDescription={setDescription}
                selectedColor={selectedColor}
              />
            )}
            {step === 1 && (
              <StepLoyalty
                maxStamps={maxStamps} setMaxStamps={setMaxStamps}
                voucherReward={voucherReward} setVoucherReward={setVoucherReward}
                selectedColor={selectedColor}
                name={name}
              />
            )}
            {step === 2 && (
              <StepStyle
                colorIndex={colorIndex} setColorIndex={setColorIndex}
                name={name} description={description}
                maxStamps={maxStamps} voucherReward={voucherReward}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA — fixed */}
      <div style={{ padding: '16px 28px 40px', flexShrink: 0 }}>
        <motion.button
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', padding: '17px', borderRadius: 16, border: 'none',
            background: loading ? `${selectedColor.accent}60` : selectedColor.accent,
            color: 'var(--accent-text)', fontWeight: 700, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.2px',
            boxShadow: loading ? 'none' : `0 6px 24px ${selectedColor.accent}35`,
            transition: 'background 0.3s, box-shadow 0.3s',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {loading ? 'Creating…' : isLastStep ? 'Launch my business →' : `Continue →`}
        </motion.button>
      </div>
    </div>
  )
}

// ─── Step components ─────────────────────────────────────────────────────────

type Color = { label: string; value: string; accent: string }

function StepIdentity({
  name, setName, description, setDescription, selectedColor,
}: {
  name: string; setName: (v: string) => void
  description: string; setDescription: (v: string) => void
  selectedColor: Color
}) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <FieldGroup label="Business name" required>
        <input
          autoFocus
          value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Kopi Kita" maxLength={50}
          style={inputStyle}
          onFocus={e => e.currentTarget.style.borderColor = selectedColor.accent}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border-soft)'}
        />
      </FieldGroup>
      <FieldGroup label="Short description" hint="Optional — shows on the loyalty card">
        <input
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Specialty coffee & pastries" maxLength={80}
          style={inputStyle}
          onFocus={e => e.currentTarget.style.borderColor = selectedColor.accent}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border-soft)'}
        />
      </FieldGroup>
    </div>
  )
}

function StepLoyalty({
  maxStamps, setMaxStamps, voucherReward, setVoucherReward, selectedColor, name,
}: {
  maxStamps: number; setMaxStamps: (v: number) => void
  voucherReward: string; setVoucherReward: (v: string) => void
  selectedColor: Color; name: string
}) {
  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Mini card preview */}
      <motion.div
        animate={{ background: selectedColor.value }}
        transition={{ duration: 0.35 }}
        style={{
          borderRadius: 18, padding: '16px 18px',
          border: `1px solid ${selectedColor.accent}20`,
          boxShadow: `0 8px 28px oklch(0 0 0 / 0.3)`,
          marginBottom: 28, position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -30, right: -10, width: 100, height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${selectedColor.accent}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${selectedColor.accent}99`, marginBottom: 4 }}>
          Preview
        </p>
        <p style={{ fontSize: 17, fontWeight: 700, color: 'oklch(0.95 0.01 65)', letterSpacing: '-0.3px', marginBottom: 12 }}>
          {name || 'Your Business'}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {Array.from({ length: maxStamps }).map((_, i) => (
            <div key={i} style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: i < 3 ? selectedColor.accent : 'oklch(1 0 0 / 0.13)',
              border: `1.5px solid ${i < 3 ? selectedColor.accent : 'oklch(1 0 0 / 0.22)'}`,
            }} />
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'oklch(0.7 0.01 65)', fontWeight: 500 }}>
          🎁 {voucherReward || 'Your reward here'}
        </p>
      </motion.div>

      <FieldGroup label="Stamps per card" hint={`${maxStamps} stamps = 1 voucher`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button type="button" onClick={() => setMaxStamps(Math.max(1, maxStamps - 1))} style={stepBtn}>−</button>
          <span style={{ fontSize: 32, fontWeight: 700, minWidth: 40, textAlign: 'center', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
            {maxStamps}
          </span>
          <button type="button" onClick={() => setMaxStamps(Math.min(20, maxStamps + 1))} style={stepBtn}>+</button>
        </div>
      </FieldGroup>

      <FieldGroup label="Voucher reward" required hint="What customers earn when card is full">
        <input
          value={voucherReward} onChange={e => setVoucherReward(e.target.value)}
          placeholder="e.g. 1 free coffee of your choice" maxLength={80}
          style={inputStyle}
          onFocus={e => e.currentTarget.style.borderColor = selectedColor.accent}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border-soft)'}
        />
      </FieldGroup>
    </div>
  )
}

function StepStyle({
  colorIndex, setColorIndex, name, description, maxStamps, voucherReward,
}: {
  colorIndex: number; setColorIndex: (i: number) => void
  name: string; description: string; maxStamps: number; voucherReward: string
}) {
  const selected = COLORS[colorIndex]
  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Full card preview */}
      <motion.div
        animate={{ background: selected.value }}
        transition={{ duration: 0.4 }}
        style={{
          borderRadius: 22, padding: '22px 22px 20px',
          border: `1px solid ${selected.accent}25`,
          boxShadow: `0 12px 40px oklch(0 0 0 / 0.35)`,
          marginBottom: 28, position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -40, right: -20, width: 130, height: 130,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${selected.accent}25 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${selected.accent}aa`, marginBottom: 5 }}>
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
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: i < 3 ? selected.accent : 'oklch(1 0 0 / 0.15)',
              border: `1.5px solid ${i < 3 ? selected.accent : 'oklch(1 0 0 / 0.25)'}`,
            }} />
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'oklch(0.7 0.01 65)', marginTop: 12, fontWeight: 500 }}>
          🎁 {voucherReward || 'Your reward here'}
        </p>
      </motion.div>

      {/* Colour swatches */}
      <FieldGroup label="Card colour">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {COLORS.map((c, i) => (
            <button
              key={c.value} type="button"
              onClick={() => setColorIndex(i)}
              title={c.label}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: c.accent, border: 'none', cursor: 'pointer', flexShrink: 0,
                outline: colorIndex === i ? `3px solid ${c.accent}` : '3px solid transparent',
                outlineOffset: 3,
                transform: colorIndex === i ? 'scale(1.18)' : 'scale(1)',
                transition: 'transform 0.2s, outline 0.15s',
              }}
            />
          ))}
        </div>
      </FieldGroup>
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FieldGroup({ label, children, required, hint }: {
  label: string; children: React.ReactNode; required?: boolean; hint?: string
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: hint ? 4 : 9 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
          {label}
        </label>
        {required && <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>required</span>}
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
