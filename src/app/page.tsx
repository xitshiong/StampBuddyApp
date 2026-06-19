'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useInView } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'
import StampBuddyLogo from '@/components/ui/Logo'
import { QrCode, ChevronDown, ArrowRight } from 'lucide-react'
import PricingSection from '@/components/ui/pricing-card'
import LandingCardSample from '@/components/wallet/LandingCardSample'
import MerchantStampQRPreview from '@/components/merchant/MerchantStampQRPreview'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

const EDITORIAL_FEATURES = [
  {
    num: '01',
    kicker: 'Your brand',
    title: 'Set up your loyalty card',
    body: 'Name your reward, choose how many stamps to earn it, and pick your colors and logo. Your branded digital card goes live in under 2 minutes — no designer, no developer, no IT.',
    visual: 'brand',
  },
  {
    num: '02',
    kicker: 'At the counter',
    title: 'Stamp customers in seconds',
    body: 'Tap the stamp count, show the QR. Each code is single-use and expires in 60 seconds — screenshots and fraud don\'t work. Need a new one? Generate it in one tap.',
    visual: 'qr',
  },
  {
    num: '03',
    kicker: 'The results',
    title: 'Watch them come back',
    body: 'Track active customers, stamp activity, and reward redemptions from your dashboard. See who\'s close to a voucher and who\'s already a regular.',
    visual: 'results',
  },
]

const TRUST_BULLETS = [
  'Live in under 2 minutes',
  'No hardware or POS',
  'Free for your customers',
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

function CardStack() {
  const cards: Array<{
    isImage?: boolean
    imagePath?: string
    color?: string
    accent?: string
    name?: string
    stamps?: number
    rotate: number
    y: number
    z: number
  }> = [
    {
      isImage: true,
      imagePath: '/example card.png',
      rotate: -6,
      y: 0,
      z: 3,
    },
    {
      isImage: true,
      imagePath: '/Card1.png',
      rotate: 2,
      y: 20,
      z: 2,
    },
    {
      isImage: true,
      imagePath: '/Card2.png',
      rotate: -3,
      y: 40,
      z: 1,
    },
  ]

  return (
    <div style={{
      position: 'relative',
      width: 'min(90vw, 520px)',
      height: 340,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -40,
    }}>
      {cards.map((card, i) => (
        <div
          key={i}
          className="hover-card"
          style={{
            position: 'absolute',
            top: card.y,
            left: '50%',
            transform: `translateX(-50%) rotate(${card.rotate}deg)`,
            width: '100%',
            aspectRatio: '1.586',
            borderRadius: 20,
            background: card.isImage ? 'transparent' : card.color,
            border: card.isImage ? 'none' : `2px solid ${card.accent}60`,
            padding: card.isImage ? 0 : 'clamp(24px, 4vw, 36px) clamp(28px, 5vw, 44px)',
            boxShadow: `0 ${16 + i * 8}px ${40 + i * 16}px var(--shadow-mid)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: card.z,
            transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1)',
            ['--rotate' as any]: `${card.rotate}deg`,
            overflow: 'hidden',
          }}
        >
          {card.isImage ? (
            <img
              src={card.imagePath}
              alt="Loyalty card"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                borderRadius: 20,
                display: 'block',
              }}
            />
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 'clamp(18px, 3.5vw, 24px)',
                  fontWeight: 900,
                  color: card.accent,
                  letterSpacing: '0.02em',
                }}>{card.name}</span>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${card.accent}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <QrCode size={22} color={card.accent} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 14px)', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 14px)' }}>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} style={{
                      width: 'clamp(40px, 7vw, 56px)',
                      height: 'clamp(40px, 7vw, 56px)',
                      borderRadius: '50%',
                      background: idx < (card.stamps ?? 0) ? card.accent : 'transparent',
                      border: `3px solid ${card.accent}`,
                      flexShrink: 0,
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 14px)' }}>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx + 4} style={{
                      width: 'clamp(40px, 7vw, 56px)',
                      height: 'clamp(40px, 7vw, 56px)',
                      borderRadius: '50%',
                      background: (idx + 4) < (card.stamps ?? 0) ? card.accent : 'transparent',
                      border: `3px solid ${card.accent}`,
                      flexShrink: 0,
                    }} />
                  ))}
                </div>
              </div>

              <p style={{
                fontSize: 'clamp(12px, 2.5vw, 15px)',
                color: `${card.accent}b0`,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}>{card.stamps ?? 0} of 8 stamps</p>
            </>
          )}
        </div>
      ))}
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const role = (profileData as any)?.role

      if (role === 'merchant') {
        router.replace('/merchant')
      } else if (role === 'customer') {
        router.replace('/customer')
      } else {
        router.replace('/auth/role')
      }
    })
  }, [router])

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
        .cta-row{display:flex;gap:16px;flex-wrap:wrap;align-items:center}
        .btn-primary{font-size:15px;font-weight:700;padding:1.1em 2.4em;border-radius:60px;border:none;background:var(--accent);color:var(--accent-text);cursor:pointer;font-family:var(--font-sans);letter-spacing:0.01em;transition:transform 0.2s,box-shadow 0.2s;position:relative;overflow:hidden;min-height:52px;display:inline-flex;align-items:center;justify-content:center;gap:8px}
        @media(min-width:640px){.btn-primary{font-size:16px;padding:1.15em 2.6em}}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 16px 40px oklch(0.50 0.16 28 / 0.25)}
        .btn-primary:active{transform:translateY(0)}
        .btn-secondary{font-size:15px;font-weight:600;padding:1em 2em;border-radius:60px;border:2px solid var(--border);background:transparent;color:var(--text-primary);cursor:pointer;font-family:var(--font-sans);letter-spacing:0.01em;transition:border-color 0.2s,color 0.2s,background 0.2s;min-height:52px;display:inline-flex;align-items:center;justify-content:center}
        @media(min-width:640px){.btn-secondary{font-size:16px;padding:1.05em 2.2em}}
        .btn-secondary:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}
        .ruled-divider{height:4px;background:var(--accent);margin:0;max-width:100px;border-radius:2px}
        .editorial-grid{display:grid;grid-template-columns:1fr;gap:0}
        @media(min-width:1024px){.editorial-grid{grid-template-columns:1fr 1fr;gap:80px}}
        .hover-card:hover{transform:translateX(-50%) rotate(var(--rotate)) translateY(-12px) !important;box-shadow:0 24px 48px var(--shadow-strong) !important}
        .cycler-words {
          overflow: hidden;
          position: relative;
          height: 1.2em;
        }
        .cycler-words::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            var(--bg-base) 0%,
            transparent 30%,
            transparent 70%,
            var(--bg-base) 100%
          );
          z-index: 20;
          pointer-events: none;
        }
        .cycler-word {
          display: block;
          height: 100%;
          line-height: 1.2em;
          animation: spin_words 8s infinite;
        }
        @keyframes spin_words {
          0%, 14% { transform: translateY(0); }
          17% { transform: translateY(-102%); }
          20%, 34% { transform: translateY(-100%); }
          37% { transform: translateY(-202%); }
          40%, 54% { transform: translateY(-200%); }
          57% { transform: translateY(-302%); }
          60%, 74% { transform: translateY(-300%); }
          77% { transform: translateY(-402%); }
          80%, 94% { transform: translateY(-400%); }
          97% { transform: translateY(-502%); }
          100% { transform: translateY(-500%); }
        }
        .flow-step-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, box-shadow 0.4s !important;
        }
        .flow-step-card:hover {
          transform: translateY(-6px) !important;
          border-color: var(--accent) !important;
          box-shadow: 0 16px 40px var(--shadow-mid) !important;
        }
        .merchant-hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }
        @media(min-width:1024px){
          .merchant-hero-grid {
            grid-template-columns: 1.2fr 1fr !important;
            gap: 64px !important;
          }
        }
        .whatsapp-btn:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 12px 36px rgba(37, 211, 102, 0.5) !important;
        }
        .whatsapp-btn:active {
          transform: translateY(0) scale(1);
        }
        .nav-link {
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: var(--accent) !important;
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(24px, 5vw, 80px)', height: 72,
        borderBottom: '1px solid var(--border-soft)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        background: 'var(--bg-elevated)',
      }}>
        <StampBuddyLogo size={32} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
            className="nav-link"
          >
            How it works
          </a>
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
            className="nav-link"
          >
            Pricing
          </a>
          <button className="btn-primary" onClick={() => router.push('/auth?intent=merchant')} style={{ padding: '0.7em 1.8em', fontSize: 14, minHeight: 44 }}>
            Start free trial
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        paddingTop: 'clamp(120px, 18vh, 180px)',
        paddingBottom: 'clamp(100px, 14vh, 160px)',
        paddingLeft: 'clamp(24px, 5vw, 80px)',
        paddingRight: 'clamp(24px, 5vw, 80px)',
        maxWidth: 1440, margin: '0 auto',
      }}>
        <div className="editorial-grid">
          <div style={{ maxWidth: 720 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease }}
              style={{ marginBottom: 32 }}
            >
              <div className="ruled-divider" style={{ marginBottom: 28 }} />
              <div style={{
                fontSize: 12, fontWeight: 800, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8,
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span>DIGITAL LOYALTY FOR</span>
                <div className="cycler-words">
                  <span className="cycler-word">CAFES</span>
                  <span className="cycler-word">PICKLEBALL</span>
                  <span className="cycler-word">BARBERS</span>
                  <span className="cycler-word">SALONS</span>
                  <span className="cycler-word">SERVICES</span>
                  <span className="cycler-word" aria-hidden="true">CAFES</span>
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              style={{
                fontSize: 'clamp(3rem, 10vw, 8rem)',
                fontWeight: 900,
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
                color: 'var(--text-primary)',
                marginBottom: 40,
                maxWidth: '14ch',
                textShadow: '0 1px 0 oklch(1 0 0 / 0.6)',
              }}
            >
              Turn visitors into regulars
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              style={{
                fontSize: 'clamp(1.125rem, 2.2vw, 1.375rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                maxWidth: '48ch',
                marginBottom: 48,
                fontWeight: 400,
              }}
            >
              Launch a branded digital stamp card in under 2 minutes. Stamp customers from your phone — no hardware, no POS integration, no app for them to download.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div className="cta-row">
                <button className="btn-primary" onClick={() => router.push('/auth?intent=merchant')}>
                  Start 7-day free trial
                  <ArrowRight size={18} />
                </button>
                <button className="btn-secondary" onClick={() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  View pricing
                </button>
              </div>
              <p style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                margin: '4px 0 0 4px',
                fontWeight: 500,
                letterSpacing: '-0.1px',
              }}>
                7-day free trial · No credit card required · Set up in under 2 minutes
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px 20px',
                marginTop: 8,
              }}>
                {TRUST_BULLETS.map((bullet) => (
                  <span key={bullet} style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      flexShrink: 0,
                    }} />
                    {bullet}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <MerchantStampQRPreview />
          </motion.div>
        </div>
      </section>

      {/* RULED DIVIDER */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
        margin: '0 clamp(24px, 5vw, 80px)',
        opacity: 0.6,
      }} />

      {/* HOW IT WORKS */}
      {EDITORIAL_FEATURES.map((feature, i) => (
        <section
          key={feature.num}
          id={i === 0 ? 'how-it-works' : undefined}
          style={{
          padding: 'clamp(120px, 16vh, 180px) clamp(24px, 5vw, 80px)',
          maxWidth: 1440, margin: '0 auto',
          background: i === 1 ? 'var(--bg-surface)' : 'transparent',
        }}>
          <SectionReveal>
            <div className="editorial-grid" style={{
              alignItems: 'center',
              flexDirection: i % 2 === 1 ? 'row-reverse' : 'row',
            }}>
              <div style={{ maxWidth: 640 }}>
                <div style={{
                  fontSize: 'clamp(5rem, 12vw, 10rem)',
                  fontWeight: 900,
                  lineHeight: 0.85,
                  color: 'transparent',
                  WebkitTextStroke: '2px oklch(0.50 0.16 28 / 0.25)',
                  letterSpacing: '-0.05em',
                  marginBottom: 24,
                }}>
                  {feature.num}
                </div>

                <div className="ruled-divider" style={{ marginBottom: 28, maxWidth: 120 }} />

                <p style={{
                  fontSize: 12, fontWeight: 800, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20
                }}>
                  {feature.kicker}
                </p>

                <h2 style={{
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: '-0.04em',
                  color: 'var(--text-primary)',
                  marginBottom: 32,
                  textShadow: 'none',
                }}>
                  {feature.title}
                </h2>

                <p style={{
                  fontSize: 'clamp(1.0625rem, 2vw, 1.25rem)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.75,
                  maxWidth: '52ch',
                  fontWeight: 400,
                }}>
                  {feature.body}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
              }}>
                {feature.visual === 'brand' && (
                  <LandingCardSample />
                )}

                {feature.visual === 'qr' && (
                  <MerchantStampQRPreview />
                )}

                {feature.visual === 'results' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    width: 'min(90vw, 400px)',
                  }}>
                    {[
                      { label: 'Active customers', value: '48', trend: '+12% this month' },
                      { label: 'Stamps given', value: '312', trend: 'Last 30 days' },
                      { label: 'Rewards redeemed', value: '27', trend: 'Repeat visits up' },
                    ].map((stat) => (
                      <div key={stat.label} style={{
                        padding: '22px 26px',
                        borderRadius: 18,
                        background: 'var(--bg-elevated)',
                        border: '1.5px solid var(--border-soft)',
                        boxShadow: '0 8px 24px var(--shadow-soft)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 16,
                      }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                            {stat.label}
                          </div>
                          <div className="num" style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                            {stat.value}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textAlign: 'right' }}>
                          {stat.trend}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SectionReveal>
        </section>
      ))}

      {/* CUSTOMER EXPERIENCE — supporting proof, not the lead */}
      <section style={{
        padding: 'clamp(80px, 12vh, 120px) clamp(24px, 5vw, 80px)',
        maxWidth: 1440,
        margin: '0 auto',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-soft)',
        borderBottom: '1px solid var(--border-soft)',
      }}>
        <SectionReveal>
          <div className="editorial-grid" style={{ alignItems: 'center' }}>
            <div style={{ maxWidth: 560 }}>
              <div className="ruled-divider" style={{ marginBottom: 28 }} />
              <p style={{
                fontSize: 12, fontWeight: 800, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20,
              }}>
                For your customers
              </p>
              <h2 style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: 24,
              }}>
                They don&apos;t need another app
              </h2>
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                maxWidth: '48ch',
              }}>
                Customers sign in once with Google, follow your business, and scan your QR. It&apos;s completely free for them — you own the relationship and the repeat visits.
              </p>
            </div>
            <CardStack />
          </div>
        </SectionReveal>
      </section>

      {/* PRICING PLANS */}
      <section id="pricing" style={{ position: 'relative' }}>
        <SectionReveal>
          <PricingSection />
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
            <FaqRow q="How does the 7-day free trial work?" a="You get full access to every feature on your chosen plan for 7 days — no credit card required. At the end of the trial, pick the plan that fits your business or cancel anytime." />
            <FaqRow q="Do my customers need to download an app?" a="No. Customers use StampBuddy in their browser — they sign in with Google once, follow your business, and scan. No app store, no install." />
            <FaqRow q="What if the QR expires before a customer scans?" a="Tap one button to generate a fresh QR. It takes a second. Each code is single-use and expires in 60 seconds to prevent fraud." />
            <FaqRow q="Can I customize my card — logo, colors, and reward?" a="Yes. Set your business name, voucher reward, stamp count, logo, banner, and card colors during onboarding. You can update everything later in Settings." />
            <FaqRow q="How many stamps should I set per card?" a="Most businesses use 8–10 stamps, but you can set anywhere from 1 to 20. You choose the reward — a free drink, discount, or any offer that brings people back." />
            <FaqRow q="Is StampBuddy free for customers?" a="Yes, completely free. Customers can follow your business, collect stamps, and redeem rewards without ever paying. You pay for the merchant plan." />
          </div>
        </SectionReveal>
      </section>

      {/* CLOSING CTA */}
      <section style={{
        padding: 'clamp(80px, 12vh, 120px) clamp(24px, 5vw, 80px)',
        textAlign: 'center',
        background: 'linear-gradient(180deg, transparent, var(--bg-surface))',
        borderTop: '1px solid var(--border-soft)',
        maxWidth: 1440,
        margin: '0 auto',
      }}>
        <SectionReveal>
          <div style={{
            maxWidth: 640,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
          }}>
            <h2 style={{
              fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Ready to grow your regular customer base?
            </h2>
            <p style={{
              fontSize: 'clamp(15px, 2vw, 17px)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 480,
            }}>
              Get started now and put your digital loyalty card in your customers' hands today.
            </p>
            
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
              <button className="btn-primary" onClick={() => router.push('/auth?intent=merchant')}>
                Start 7-day free trial
                <ArrowRight size={18} />
              </button>
              <a
                href="https://wa.me/601161665322?text=Hi%2C%20I%27m%20interested%20in%20StampBuddy%20for%20my%20business"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ textDecoration: 'none' }}
              >
                Chat with us
              </a>
            </div>
            
            <p style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              margin: 0,
              fontWeight: 500,
            }}>
              7-day free trial • Cancel anytime • Setup takes under 2 minutes
            </p>
          </div>
        </SectionReveal>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--border-soft)',
        padding: 'clamp(48px, 8vh, 72px) clamp(24px, 5vw, 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <StampBuddyLogo size={32} />
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
            Made for local businesses
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Loyalty software for merchants ·{' '}
            <a href="/join" style={{ color: 'inherit', textDecoration: 'underline' }}>
              Free for customers
            </a>
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            <a href="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>Terms of Service</a>
            {" • "}
            <a href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy Policy</a>
          </p>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href="https://wa.me/601161665322?text=Hi%2C%20I%27m%20interested%20in%20StampBuddy%20for%20my%20business"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: '#25D366',
          color: '#ffffff',
          borderRadius: 50,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 8px 32px rgba(37, 211, 102, 0.35)',
          textDecoration: 'none',
          fontWeight: 800,
          fontSize: 14,
          fontFamily: 'var(--font-sans)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s',
        }}
        className="whatsapp-btn"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
        >
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.371 5.028L2 22l5.132-1.347a9.926 9.926 0 0 0 4.877 1.277h.005c5.505 0 9.989-4.478 9.99-9.985A9.98 9.98 0 0 0 12.012 2zm5.72 14.158c-.313.88-1.528 1.575-2.114 1.637-.585.062-1.17.292-3.76-.732-3.116-1.234-5.123-4.385-5.278-4.594-.156-.208-1.252-1.664-1.252-3.175 0-1.512.793-2.254 1.074-2.553.282-.3.616-.375.82-.375H8.05c.156 0 .375.059.57.531.2.477.676 1.652.735 1.77.06.12.1.259.02.419-.08.16-.12.259-.24.399-.12.14-.25.312-.357.419-.12.12-.245.25-.105.49.14.239.62 1.02 1.332 1.652.915.814 1.685 1.067 1.923 1.186.24.119.378.1.517-.06.14-.16.6-1.042.756-1.252.156-.21.312-.179.528-.1.216.08 1.37.646 1.606.76.236.12.393.18.45.28.058.1.058.58-.255 1.46z" />
        </svg>
        <span>Chat on WhatsApp</span>
      </a>
    </div>
  )
}
