'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { useAppStore } from '@/store/app'
import StampBuddyLogo from '@/components/ui/Logo'
import { QrCode, Smartphone, Gift, Store, Zap, ShieldCheck, ChevronDown } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

const CARD_PREVIEWS = [
  { color: 'oklch(0.28 0.08 30)',  accent: 'oklch(0.72 0.17 30)',  stamps: 5, name: 'Kopi Kita',    rotate: -7 },
  { color: 'oklch(0.24 0.08 150)', accent: 'oklch(0.66 0.16 155)', stamps: 3, name: 'Brew Society', rotate: -2 },
  { color: 'oklch(0.22 0.08 260)', accent: 'oklch(0.65 0.18 260)', stamps: 7, name: 'Roast & Co.',  rotate: 4  },
]

const STEPS = [
  {
    icon: Store,
    num: '01',
    title: 'Merchant sets the stamp count',
    body: 'Cafe owner taps how many stamps to give on the numpad. Takes two seconds.',
  },
  {
    icon: QrCode,
    num: '02',
    title: 'A one-time QR code appears',
    body: 'A unique QR generates with a 60-second countdown. No hardware, no POS integration needed.',
  },
  {
    icon: Smartphone,
    num: '03',
    title: 'Customer scans and stamps land',
    body: 'Customer opens their wallet, taps Scan, points at the QR. Stamps appear instantly.',
  },
]

const CUSTOMER_POINTS = [
  { icon: '☕', title: 'All your cafes, one wallet', body: 'Follow multiple cafes and keep every loyalty card in one place. No more fumbling through a paper stack.' },
  { icon: '🎁', title: 'Redeem real rewards', body: 'Fill a card, unlock a voucher. Slide to redeem at the counter and the countdown begins.' },
  { icon: '📱', title: 'No app install needed', body: 'StampBuddy is a PWA. Add it to your home screen in one tap from any browser.' },
]

const MERCHANT_POINTS = [
  { icon: '⚡', title: 'No hardware, no setup cost', body: 'All you need is your phone. No QR printer, no loyalty terminal, no monthly SaaS fee.' },
  { icon: '🔒', title: 'Stamps can\'t be faked', body: 'Every QR session is one-time use and expires in 60 seconds. Customers can only scan it once.' },
  { icon: '🏪', title: 'Your card, your brand', body: 'Choose a card colour, set the reward, pick how many stamps per card. Done in under a minute.' },
]

const FAQS = [
  { q: 'Does the customer need to create an account?', a: 'Yes, a quick sign-in with Google takes about 10 seconds. No forms, no passwords.' },
  { q: 'What if the QR expires before the customer scans?', a: 'The merchant taps a button to generate a fresh one. Takes one second.' },
  { q: 'Can one customer follow multiple cafes?', a: 'Yes. Each cafe gets its own loyalty card in the customer\'s wallet.' },
  { q: 'Is there a limit on how many stamps a card can hold?', a: 'Merchants set this when creating their business, anywhere from 1 to 20 stamps per card.' },
  { q: 'How much does it cost?', a: 'Free for customers. Free for merchants. No plans, no upsells.' },
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = el.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('visible'); obs.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    targets.forEach(t => obs.observe(t))
    return () => obs.disconnect()
  }, [])
  return ref
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border-soft)', padding: '0' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
          fontSize: 16, fontWeight: 600, textAlign: 'left', gap: 16,
        }}
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown size={18} style={{
          color: 'var(--accent)', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </button>
      <div className={`faq-body${open ? ' open' : ''}`}>
        <div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65, paddingBottom: 20 }}>{a}</p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const revealRef = useReveal()
  const { profile } = useAppStore()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      if (profile?.role === 'merchant') router.replace('/merchant')
      else if (profile?.role === 'customer') router.replace('/customer')
      else router.replace('/auth/role')
    })
  }, [router, profile])

  return (
    <div ref={revealRef} style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <style>{`
        .hero-grid{display:grid;grid-template-columns:1fr;gap:60px;align-items:center}
        @media(min-width:768px){.hero-grid{grid-template-columns:1fr 1fr;gap:80px}}
        .points-grid{display:grid;grid-template-columns:1fr;gap:0}
        @media(min-width:640px){.points-grid{grid-template-columns:repeat(3,1fr);gap:0 40px}}
        .steps-list{display:flex;flex-direction:column}
        @media(min-width:768px){.steps-list{flex-direction:row;gap:0}}
        .step-item{flex:1;padding:40px 0;border-top:1px solid var(--border-soft)}
        @media(min-width:768px){.step-item{padding:40px 32px 40px 0}}
        .trust-grid{display:grid;grid-template-columns:1fr;gap:16px}
        @media(min-width:640px){.trust-grid{grid-template-columns:repeat(3,1fr)}}
        .card-stack-wrap{position:relative;height:260px;display:flex;align-items:center;justify-content:center}
        @media(min-width:768px){.card-stack-wrap{height:320px}}
        .hero-ctas{display:flex;gap:12px;flex-wrap:wrap}
        .ghost-btn{font-size:15px;font-weight:600;padding:0.9em 2em;border-radius:6em;border:1.5px solid var(--border);background:transparent;color:var(--text-primary);cursor:pointer;font-family:var(--font-sans);letter-spacing:0.02em;transition:border-color 0.2s,color 0.2s}
        .ghost-btn:hover{border-color:var(--accent);color:var(--accent)}
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 5vw, 60px)', height: 64,
        borderBottom: '1px solid var(--border-soft)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'oklch(0.09 0.012 55 / 0.88)',
      }}>
        <StampBuddyLogo size={28} />
        <button className="btn" onClick={() => router.push('/auth')} style={{ padding: '0.55em 1.5em', fontSize: 13 }}>
          Get started
        </button>
      </nav>

      {/* HERO */}
      <section style={{
        paddingTop: 'clamp(100px, 15vw, 140px)',
        paddingBottom: 'clamp(80px, 12vw, 120px)',
        paddingLeft: 'clamp(20px, 5vw, 60px)',
        paddingRight: 'clamp(20px, 5vw, 60px)',
        maxWidth: 1200, margin: '0 auto',
      }}>
        <div className="hero-grid">
          <div style={{ maxWidth: '44ch' }}>
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              style={{ fontSize: 'var(--text-label)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20 }}
            >
              Digital loyalty for neighbourhood cafes
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease }}
              style={{ fontSize: 'var(--text-xl)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: 24 }}
            >
              Your coffee stamps,<br />finally in one place.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease }}
              style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '44ch', marginBottom: 40 }}
            >
              Follow your favourite cafes, collect stamps with a scan, redeem real rewards. No paper. No app install.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease }}
              className="hero-ctas"
            >
              <button className="btn" onClick={() => router.push('/auth')} style={{ fontSize: 15 }}>
                I&apos;m a customer
              </button>
              <button className="ghost-btn" onClick={() => router.push('/auth')}>
                I run a cafe
              </button>
            </motion.div>
          </div>

          <div className="card-stack-wrap">
            {CARD_PREVIEWS.map((card, i) => (
              <CardPreview key={card.name} card={card} index={i} />
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'var(--border-soft)', margin: '0 clamp(20px, 5vw, 60px)' }} />

      {/* HOW IT WORKS */}
      <section style={{
        padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
        maxWidth: 1200, margin: '0 auto',
      }}>
        <div className="reveal" style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 'var(--text-label)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>
            How it works
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: 16 }}>
            Three taps. Done.
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', maxWidth: '40ch', lineHeight: 1.65 }}>
            The whole flow takes under 10 seconds. No hardware, no training, no setup.
          </p>
        </div>

        <div className="steps-list">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.num} className="step-item reveal" style={{ '--i': i } as React.CSSProperties}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 800, lineHeight: 1,
                    color: 'var(--accent)', letterSpacing: '-0.04em', minWidth: '2ch',
                    fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                  }}>{step.num}</span>
                  <div style={{ paddingTop: 6 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: 'var(--accent-dim)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 14,
                    }}>
                      <Icon size={20} color="var(--accent)" />
                    </div>
                    <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.3 }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '28ch' }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ borderTop: '1px solid var(--border-soft)' }} />
      </section>

      <div style={{ height: 1, background: 'var(--border-soft)', margin: '0 clamp(20px, 5vw, 60px)' }} />

      {/* FOR CUSTOMERS */}
      <section style={{
        padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
        maxWidth: 1200, margin: '0 auto',
      }}>
        <div className="reveal" style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 'var(--text-label)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>
            For customers
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            Built for cafe regulars.
          </h2>
        </div>
        <div className="points-grid">
          {CUSTOMER_POINTS.map((pt, i) => (
            <div key={pt.title} className="reveal" style={{ '--i': i, padding: '32px 0', borderTop: '1px solid var(--border-soft)' } as React.CSSProperties}>
              <div style={{ fontSize: 30, marginBottom: 16 }}>{pt.icon}</div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.3 }}>{pt.title}</h3>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '28ch' }}>{pt.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOR MERCHANTS */}
      <section style={{ background: 'var(--bg-surface)' }}>
        <div style={{
          padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
          maxWidth: 1200, margin: '0 auto',
        }}>
          <div className="reveal" style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 'var(--text-label)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>
              For merchants
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              Run your loyalty program from your phone.
            </h2>
          </div>
          <div className="points-grid">
            {MERCHANT_POINTS.map((pt, i) => (
              <div key={pt.title} className="reveal" style={{ '--i': i, padding: '32px 0', borderTop: '1px solid var(--border)' } as React.CSSProperties}>
                <div style={{ fontSize: 30, marginBottom: 16 }}>{pt.icon}</div>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.3 }}>{pt.title}</h3>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '28ch' }}>{pt.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{
        padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
        maxWidth: 1200, margin: '0 auto', textAlign: 'center',
      }}>
        <div className="reveal">
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: 16 }}>
            Free for everyone.<br />Always.
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', maxWidth: '40ch', margin: '0 auto 56px', lineHeight: 1.65 }}>
            No plans. No upsells. No credit card. StampBuddy is free for customers and merchants alike.
          </p>
        </div>
        <div className="trust-grid reveal" style={{ maxWidth: 720, margin: '0 auto 56px' }}>
          {[
            { icon: <Zap size={20} color="var(--accent)" />, label: 'No hardware needed', sub: 'Just your phone' },
            { icon: <ShieldCheck size={20} color="var(--accent)" />, label: "Stamps can't be faked", sub: 'One-time QR, 60s expiry' },
            { icon: <Gift size={20} color="var(--accent)" />, label: 'Real rewards', sub: 'Vouchers, not points' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              padding: '28px 20px', borderRadius: 'var(--r-card)',
              background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{item.sub}</p>
            </div>
          ))}
        </div>
        <div className="reveal">
          <button className="btn" onClick={() => router.push('/auth')} style={{ fontSize: 16, padding: '1em 3em' }}>
            Get started free
          </button>
        </div>
      </section>

      <div style={{ height: 1, background: 'var(--border-soft)', margin: '0 clamp(20px, 5vw, 60px)' }} />

      {/* FAQ */}
      <section style={{
        padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
        maxWidth: 800, margin: '0 auto',
      }}>
        <div className="reveal" style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            Questions?
          </h2>
        </div>
        <div className="reveal">
          {FAQS.map(faq => <FaqRow key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--border-soft)',
        padding: 'clamp(40px, 6vw, 60px) clamp(20px, 5vw, 60px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StampBuddyLogo size={24} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Made for neighbourhood cafes.
          </span>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Free for customers and merchants.
        </p>
      </footer>
    </div>
  )
}

function CardPreview({ card, index }: { card: typeof CARD_PREVIEWS[0]; index: number }) {
  const floatY = [-6, 6, -6]
  const floatDuration = [3.2, 3.8, 3.5][index]
  const floatDelay = [0, 0.6, 1.2][index]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: card.rotate }}
      animate={{
        opacity: 1,
        y: floatY,
        rotate: card.rotate,
      }}
      transition={{
        opacity: { duration: 0.55, delay: index * 0.1, ease },
        y: {
          duration: floatDuration,
          delay: floatDelay,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
        rotate: { duration: 0.55, delay: index * 0.1, ease },
      }}
      style={{
        position: 'absolute',
        width: 240,
        height: 148,
        borderRadius: 18,
        background: card.color,
        border: `1px solid oklch(from ${card.accent} l c h / 0.3)`,
        padding: '18px 20px',
        top: `${(index - 1) * 18}px`,
        left: `${(index - 1) * 14}px`,
        zIndex: index,
        boxShadow: `0 ${8 + index * 6}px ${24 + index * 12}px oklch(0 0 0 / 0.4)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: 13, fontWeight: 700, color: card.accent,
          letterSpacing: '0.01em', lineHeight: 1.2,
        }}>{card.name}</span>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `oklch(from ${card.accent} l c h / 0.18)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <QrCode size={14} color={card.accent} />
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              width: 18, height: 18, borderRadius: '50%',
              background: i < card.stamps
                ? card.accent
                : `oklch(from ${card.accent} l c h / 0.15)`,
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
        <p style={{
          fontSize: 11, color: `oklch(from ${card.accent} l c h / 0.6)`,
          fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>{card.stamps} of 8 stamps</p>
      </div>
    </motion.div>
  )
}
