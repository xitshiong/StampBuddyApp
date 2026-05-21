'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useInView } from 'framer-motion'
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

const HOW_STEPS = [
  { num: '01', title: 'Merchant taps stamp count', body: 'Cafe owner enters how many stamps to give. Two seconds, done.' },
  { num: '02', title: 'QR code appears', body: 'One-time QR with 60-second countdown. No hardware needed.' },
  { num: '03', title: 'Customer scans, stamps land', body: 'Open wallet, scan QR, stamps appear instantly. No typing, no friction.' },
]

const WHY_CUSTOMER = [
  { title: 'All cafes, one wallet', body: 'Follow every spot you love. No more paper cards falling out of your wallet.' },
  { title: 'Real rewards you can use', body: 'Fill a card, unlock a voucher. Slide to redeem and watch the 5-minute countdown.' },
  { title: 'Works in any browser', body: 'No app store. Add to home screen in one tap. Works offline.' },
]

const WHY_MERCHANT = [
  { title: 'Zero hardware cost', body: 'Your phone is the terminal. No QR printer, no monthly fees, no POS integration.' },
  { title: 'Impossible to fake', body: 'Every QR is one-time use, expires in 60 seconds. Screenshots are useless.' },
  { title: 'Your brand, your rules', body: 'Pick card color, set reward, choose stamp count. Setup takes under a minute.' },
]

function SectionReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <div ref={ref} style={{
      opacity: isInView ? 1 : 0,
      transform: isInView ? 'translateY(0)' : 'translateY(32px)',
      transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {children}
    </div>
  )
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border-soft)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
          fontSize: 17, fontWeight: 600, textAlign: 'left', gap: 20,
        }}
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown size={20} style={{
          color: 'var(--accent)', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </button>
      <div className={`faq-body${open ? ' open' : ''}`}>
        <div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, paddingBottom: 22 }}>{a}</p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { profile } = useAppStore()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      if (profile?.role === 'merchant') router.replace('/merchant')
      else if (profile?.role === 'customer') router.replace('/customer')
      else router.replace('/auth/role')
    })
  }, [router, profile])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div style={{
      background: 'var(--bg-base)',
      minHeight: '100vh',
      position: 'relative',
      backgroundImage: `
        linear-gradient(45deg, oklch(0.12 0.015 55) 25%, transparent 25%),
        linear-gradient(-45deg, oklch(0.12 0.015 55) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, oklch(0.12 0.015 55) 75%),
        linear-gradient(-45deg, transparent 75%, oklch(0.12 0.015 55) 75%)
      `,
      backgroundSize: '40px 40px',
      backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
    }}>
      {/* CUSTOM CURSOR */}
      <div style={{
        position: 'fixed',
        left: mousePos.x,
        top: mousePos.y,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: 'var(--accent)',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.2s, height 0.2s',
        mixBlendMode: 'difference',
        display: 'none',
      }}
      className="custom-cursor-dot" />
      <div style={{
        position: 'fixed',
        left: mousePos.x,
        top: mousePos.y,
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '1px solid var(--accent)',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.15s ease-out, height 0.15s ease-out, opacity 0.15s',
        opacity: 0.4,
        display: 'none',
      }}
      className="custom-cursor-ring" />

      <style>{`
        @media(hover:hover){* { cursor: none !important; }.custom-cursor-dot,.custom-cursor-ring{display:block!important}}
        .hero-grid{display:grid;grid-template-columns:1fr;gap:48px;align-items:center}
        @media(min-width:900px){.hero-grid{grid-template-columns:1fr 1fr;gap:80px}}
        .step-grid{display:grid;grid-template-columns:1fr;gap:0}
        @media(min-width:768px){.step-grid{grid-template-columns:repeat(3,1fr);gap:0}}
        .benefit-grid{display:grid;grid-template-columns:1fr;gap:32px}
        @media(min-width:640px){.benefit-grid{grid-template-columns:repeat(3,1fr);gap:40px}}
        .card-stack-wrap{position:relative;height:380px;display:flex;align-items:center;justify-content:center;padding:20px;transform:rotate(-3deg)}
        @media(min-width:900px){.card-stack-wrap{height:600px;padding:60px}}
        .cta-row{display:flex;gap:14px;flex-wrap:wrap;align-items:center;justify-content:center}
        @media(min-width:640px){.cta-row{justify-content:flex-start}}
        .btn-primary{font-size:15px;font-weight:700;padding:1em 2em;border-radius:60px;border:none;background:var(--accent);color:var(--accent-text);cursor:pointer;font-family:var(--font-sans);letter-spacing:0.01em;transition:transform 0.2s,box-shadow 0.2s;position:relative;overflow:hidden;min-height:48px;display:inline-flex;align-items:center;justify-content:center}
        @media(min-width:640px){.btn-primary{font-size:16px;padding:1em 2.2em}}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 32px oklch(0.76 0.14 78 / 0.3)}
        .btn-primary:active{transform:translateY(0)}
        .btn-secondary{font-size:15px;font-weight:600;padding:0.85em 1.8em;border-radius:60px;border:2px solid var(--border);background:transparent;color:var(--text-primary);cursor:pointer;font-family:var(--font-sans);letter-spacing:0.01em;transition:border-color 0.2s,color 0.2s,background 0.2s;min-height:48px;display:inline-flex;align-items:center;justify-content:center}
        @media(min-width:640px){.btn-secondary{font-size:16px;padding:0.9em 2em}}
        .btn-secondary:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}
        .ruled-divider{height:3px;background:var(--accent);margin:0 auto;max-width:80px;border-radius:2px}
        .step-connector{position:absolute;top:50%;left:100%;width:100%;height:2px;background:linear-gradient(90deg,var(--accent) 0%,var(--border) 100%);transform:translateY(-50%);opacity:0.3}
        @media(max-width:767px){.step-connector{display:none}}
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 5vw, 64px)', height: 64,
        borderBottom: '1px solid var(--border-soft)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        background: 'oklch(0.09 0.012 55 / 0.9)',
      }}>
        <StampBuddyLogo size={28} />
        <button className="btn-primary" onClick={() => router.push('/auth')} style={{ padding: '0.6em 1.5em', fontSize: 13, minHeight: 40 }}>
          Get started
        </button>
      </nav>

      {/* HERO */}
      <section style={{
        paddingTop: 'clamp(100px, 16vh, 140px)',
        paddingBottom: 'clamp(80px, 12vh, 120px)',
        paddingLeft: 'clamp(20px, 5vw, 64px)',
        paddingRight: 'clamp(20px, 5vw, 64px)',
        maxWidth: 1280, margin: '0 auto',
      }}>
        <div className="hero-grid">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease }}
              style={{ marginBottom: 28 }}
            >
              <div className="ruled-divider" style={{ margin: '0 0 24px 0' }} />
              <p style={{
                fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6
              }}>
                Digital loyalty for restaurants
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              style={{
                fontSize: 'clamp(2.25rem, 7vw, 4.5rem)',
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: 28,
                maxWidth: '16ch',
              }}
            >
              Your stamps, finally in one place
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: '42ch',
                marginBottom: 40,
                fontWeight: 400,
              }}
            >
              Follow every cafe you love. Collect stamps with a scan. Redeem real rewards.
              No paper cards, no app store, no friction.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="cta-row"
            >
              <button className="btn-primary" onClick={() => router.push('/auth')}>
                I'm a customer
              </button>
              <button className="btn-secondary" onClick={() => router.push('/auth')}>
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

      {/* RULED DIVIDER */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '0 clamp(24px, 5vw, 64px)'
      }} />

      {/* HOW IT WORKS */}
      <section style={{
        padding: 'clamp(100px, 14vh, 140px) clamp(24px, 5vw, 64px)',
        maxWidth: 1280, margin: '0 auto',
      }}>
        <SectionReveal>
          <div style={{ marginBottom: 80, maxWidth: 680 }}>
            <div className="ruled-divider" style={{ margin: '0 0 24px 0' }} />
            <p style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20
            }}>
              How it works
            </p>
            <h2 style={{
              fontSize: 'clamp(2.25rem, 6.5vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: 24,
            }}>
              Three taps.<br />Done.
            </h2>
            <p style={{
              fontSize: 18,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '44ch',
            }}>
              The whole flow takes under 10 seconds. No hardware, no training, no setup cost.
            </p>
          </div>
        </SectionReveal>

        <div className="step-grid">
          {HOW_STEPS.map((step, i) => (
            <SectionReveal key={step.num}>
              <div style={{
                position: 'relative',
                padding: '48px 32px 48px 0',
                borderTop: '3px solid var(--accent)',
              }}>
                {i < HOW_STEPS.length - 1 && <div className="step-connector" />}

                <div style={{
                  fontSize: 'clamp(4rem, 10vw, 6rem)',
                  fontWeight: 900,
                  lineHeight: 0.9,
                  color: 'var(--accent)',
                  letterSpacing: '-0.04em',
                  marginBottom: 24,
                  opacity: 0.9,
                }}>
                  {step.num}
                </div>

                <h3 style={{
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: 14,
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}>
                  {step.title}
                </h3>

                <p style={{
                  fontSize: 16,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  maxWidth: '32ch',
                }}>
                  {step.body}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* RULED DIVIDER */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '0 clamp(24px, 5vw, 64px)'
      }} />

      {/* FOR CUSTOMERS */}
      <section style={{
        padding: 'clamp(100px, 14vh, 140px) clamp(24px, 5vw, 64px)',
        maxWidth: 1280, margin: '0 auto',
      }}>
        <SectionReveal>
          <div style={{ marginBottom: 72 }}>
            <div className="ruled-divider" style={{ margin: '0 0 24px 0' }} />
            <p style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20
            }}>
              For customers
            </p>
            <h2 style={{
              fontSize: 'clamp(2rem, 5.5vw, 3.5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}>
              Built for cafe regulars
            </h2>
          </div>
        </SectionReveal>

        <div className="benefit-grid">
          {WHY_CUSTOMER.map((item, i) => (
            <SectionReveal key={item.title}>
              <div style={{
                padding: '40px 0',
                borderTop: '2px solid var(--border)',
              }}>
                <h3 style={{
                  fontSize: 'clamp(1.25rem, 2.2vw, 1.5rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: 16,
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: 16,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  maxWidth: '32ch',
                }}>
                  {item.body}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* FOR MERCHANTS */}
      <section style={{ background: 'var(--bg-surface)' }}>
        <div style={{
          padding: 'clamp(100px, 14vh, 140px) clamp(24px, 5vw, 64px)',
          maxWidth: 1280, margin: '0 auto',
        }}>
          <SectionReveal>
            <div style={{ marginBottom: 72 }}>
              <div className="ruled-divider" style={{ margin: '0 0 24px 0' }} />
              <p style={{
                fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20
              }}>
                For merchants
              </p>
              <h2 style={{
                fontSize: 'clamp(2rem, 5.5vw, 3.5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
              }}>
                Run loyalty from your phone
              </h2>
            </div>
          </SectionReveal>

          <div className="benefit-grid">
            {WHY_MERCHANT.map((item, i) => (
              <SectionReveal key={item.title}>
                <div style={{
                  padding: '40px 0',
                  borderTop: '2px solid var(--border)',
                }}>
                  <h3 style={{
                    fontSize: 'clamp(1.25rem, 2.2vw, 1.5rem)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: 16,
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: 16,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    maxWidth: '32ch',
                  }}>
                    {item.body}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / CTA */}
      <section style={{
        padding: 'clamp(100px, 14vh, 140px) clamp(24px, 5vw, 64px)',
        maxWidth: 1080, margin: '0 auto', textAlign: 'center',
      }}>
        <SectionReveal>
          <div className="ruled-divider" style={{ marginBottom: 32 }} />
          <h2 style={{
            fontSize: 'clamp(2.25rem, 6.5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: 24,
          }}>
            Free for everyone.<br />Always.
          </h2>
          <p style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            maxWidth: '44ch',
            margin: '0 auto 64px',
            lineHeight: 1.7,
          }}>
            No plans. No upsells. No credit card. StampBuddy is free for customers and merchants alike.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            maxWidth: 800,
            margin: '0 auto 64px',
          }}>
            {[
              { icon: <Zap size={24} />, label: 'No hardware', sub: 'Just your phone' },
              { icon: <ShieldCheck size={24} />, label: "Can't be faked", sub: '60s expiry' },
              { icon: <Gift size={24} />, label: 'Real rewards', sub: 'Not points' },
            ].map(item => (
              <div key={item.label} style={{
                padding: '36px 24px',
                borderRadius: 20,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'var(--accent-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                  }}>
                    {item.label}
                  </p>
                  <p style={{
                    fontSize: 14,
                    color: 'var(--text-muted)',
                  }}>
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={() => router.push('/auth')} style={{
            fontSize: 17,
            padding: '1.1em 3em',
          }}>
            Get started free
          </button>
        </SectionReveal>
      </section>

      {/* RULED DIVIDER */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '0 clamp(24px, 5vw, 64px)'
      }} />

      {/* FAQ */}
      <section style={{
        padding: 'clamp(100px, 14vh, 140px) clamp(24px, 5vw, 64px)',
        maxWidth: 880, margin: '0 auto',
      }}>
        <SectionReveal>
          <div style={{ marginBottom: 56 }}>
            <div className="ruled-divider" style={{ margin: '0 0 24px 0' }} />
            <h2 style={{
              fontSize: 'clamp(2rem, 5.5vw, 3rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}>
              Questions?
            </h2>
          </div>
        </SectionReveal>

        <SectionReveal>
          <div>
            <FaqRow q="Does the customer need to create an account?" a="Yes, a quick sign-in with Google takes about 10 seconds. No forms, no passwords." />
            <FaqRow q="What if the QR expires before the customer scans?" a="The merchant taps a button to generate a fresh one. Takes one second." />
            <FaqRow q="Can one customer follow multiple cafes?" a="Yes. Each cafe gets its own loyalty card in the customer's wallet." />
            <FaqRow q="Is there a limit on how many stamps a card can hold?" a="Merchants set this when creating their business, anywhere from 1 to 20 stamps per card." />
            <FaqRow q="How much does it cost?" a="Free for customers. Free for merchants. No plans, no upsells." />
          </div>
        </SectionReveal>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--border-soft)',
        padding: 'clamp(48px, 8vh, 72px) clamp(24px, 5vw, 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <StampBuddyLogo size={28} />
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
            Made for neighbourhood cafes
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Free for customers and merchants
        </p>
      </footer>
    </div>
  )
}

function CardPreview({ card, index }: { card: typeof CARD_PREVIEWS[0]; index: number }) {
  const floatY = [-10, 10, -10]
  const floatDuration = [3.2, 3.8, 3.5][index]
  const floatDelay = [0, 0.6, 1.2][index]

  return (
    <motion.div
      initial={{ opacity: 0, y: 80, rotate: card.rotate }}
      animate={{
        opacity: 1,
        y: floatY,
        rotate: card.rotate,
      }}
      transition={{
        opacity: { duration: 0.7, delay: index * 0.14, ease },
        y: {
          duration: floatDuration,
          delay: floatDelay,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
        rotate: { duration: 0.7, delay: index * 0.14, ease },
      }}
      style={{
        position: 'absolute',
        width: 'min(90vw, 420px)',
        height: 'min(42vw, 200px)',
        borderRadius: 16,
        background: card.color,
        border: `1.5px solid oklch(from ${card.accent} l c h / 0.4)`,
        padding: 'clamp(20px, 4vw, 28px) clamp(24px, 5vw, 36px)',
        top: `50%`,
        left: `50%`,
        transform: `translate(-50%, -50%) translateY(${(index - 1) * 20}px) translateX(${(index - 1) * 14}px) rotate(${card.rotate}deg)`,
        zIndex: index,
        boxShadow: `0 ${12 + index * 8}px ${32 + index * 16}px oklch(0 0 0 / 0.6)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 800, color: card.accent,
          letterSpacing: '0.02em', lineHeight: 1,
        }}>{card.name}</span>
        <div style={{
          width: 'clamp(36px, 7vw, 42px)', height: 'clamp(36px, 7vw, 42px)', borderRadius: 10,
          background: `oklch(from ${card.accent} l c h / 0.22)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <QrCode size={18} color={card.accent} />
        </div>
      </div>

      {/* 2 rows of 4 stamps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 12px)', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              width: 'clamp(36px, 7vw, 48px)',
              height: 'clamp(36px, 7vw, 48px)',
              borderRadius: '50%',
              background: i < card.stamps
                ? card.accent
                : 'transparent',
              border: `2.5px solid ${card.accent}`,
              transition: 'background 0.2s',
              flexShrink: 0,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i + 4} style={{
              width: 'clamp(36px, 7vw, 48px)',
              height: 'clamp(36px, 7vw, 48px)',
              borderRadius: '50%',
              background: (i + 4) < card.stamps
                ? card.accent
                : 'transparent',
              border: `2.5px solid ${card.accent}`,
              transition: 'background 0.2s',
              flexShrink: 0,
            }} />
          ))}
        </div>
      </div>

      {/* Footer text */}
      <p style={{
        fontSize: 'clamp(11px, 2.5vw, 14px)', color: `oklch(from ${card.accent} l c h / 0.7)`,
        fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        textAlign: 'center',
      }}>{card.stamps} of 8 stamps</p>
    </motion.div>
  )
}
