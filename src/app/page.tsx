'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useInView } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'
import StampBuddyLogo from '@/components/ui/Logo'
import { QrCode, Gift, Zap, ShieldCheck, ChevronDown, ArrowRight } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

const EDITORIAL_FEATURES = [
  {
    num: '01',
    kicker: 'For customers',
    title: 'All your cafes, one wallet',
    body: 'Follow every spot you love. Collect stamps with a scan. Redeem real rewards. No paper cards falling out of your wallet, no app store friction.',
    visual: 'wallet'
  },
  {
    num: '02',
    kicker: 'For merchants',
    title: 'Zero hardware cost',
    body: 'Your phone is the terminal. Generate one-time QR codes in two seconds. No printer, no monthly fees, no POS integration. Impossible to fake.',
    visual: 'qr'
  },
  {
    num: '03',
    kicker: 'The flow',
    title: 'Three taps. Done.',
    body: 'Merchant taps stamp count. QR appears with 60-second countdown. Customer scans, stamps land instantly. The whole transaction takes under 10 seconds.',
    visual: 'flow'
  },
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
            boxShadow: `0 ${16 + i * 8}px ${40 + i * 16}px oklch(0 0 0 / 0.7)`,
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
        .cta-row{display:flex;gap:16px;flex-wrap:wrap;align-items:center}
        .btn-primary{font-size:15px;font-weight:700;padding:1.1em 2.4em;border-radius:60px;border:none;background:var(--accent);color:var(--accent-text);cursor:pointer;font-family:var(--font-sans);letter-spacing:0.01em;transition:transform 0.2s,box-shadow 0.2s;position:relative;overflow:hidden;min-height:52px;display:inline-flex;align-items:center;justify-content:center;gap:8px}
        @media(min-width:640px){.btn-primary{font-size:16px;padding:1.15em 2.6em}}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 16px 40px oklch(0.76 0.14 78 / 0.35)}
        .btn-primary:active{transform:translateY(0)}
        .btn-secondary{font-size:15px;font-weight:600;padding:1em 2em;border-radius:60px;border:2px solid var(--border);background:transparent;color:var(--text-primary);cursor:pointer;font-family:var(--font-sans);letter-spacing:0.01em;transition:border-color 0.2s,color 0.2s,background 0.2s;min-height:52px;display:inline-flex;align-items:center;justify-content:center}
        @media(min-width:640px){.btn-secondary{font-size:16px;padding:1.05em 2.2em}}
        .btn-secondary:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}
        .ruled-divider{height:4px;background:var(--accent);margin:0;max-width:100px;border-radius:2px}
        .editorial-grid{display:grid;grid-template-columns:1fr;gap:0}
        @media(min-width:1024px){.editorial-grid{grid-template-columns:1fr 1fr;gap:80px}}
        .hover-card:hover{transform:translateX(-50%) rotate(var(--rotate)) translateY(-12px) !important;box-shadow:0 32px 72px oklch(0 0 0 / 0.9) !important}
        .text-shine {
          background: linear-gradient(to right, #9f9f9f 0%, #fff 10%, #868686 20%, #9f9f9f 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s infinite linear;
        }
        @keyframes shine {
          0% { background-position: 0; }
          60% { background-position: -200%; }
          100% { background-position: -200%; }
        }
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
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(24px, 5vw, 80px)', height: 72,
        borderBottom: '1px solid var(--border-soft)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        background: 'oklch(0.09 0.012 55 / 0.92)',
      }}>
        <StampBuddyLogo size={32} />
        <button className="btn-primary" onClick={() => router.push('/auth')} style={{ padding: '0.7em 1.8em', fontSize: 14, minHeight: 44 }}>
          Get started
        </button>
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
                  <span className="cycler-word">RESTAURANTS</span>
                  <span className="cycler-word">CAFES</span>
                  <span className="cycler-word">BARS</span>
                  <span className="cycler-word">BARBERS</span>
                  <span className="cycler-word">SHOPS</span>
                  <span className="cycler-word" aria-hidden="true">RESTAURANTS</span>
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
                textShadow: '0 2px 24px oklch(0 0 0 / 0.5)',
              }}
            >
              Your <span className="text-shine">stamps</span>, finally in one place
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
              Follow every cafe you love. Collect stamps with a scan. Redeem real rewards.
              No paper cards, no app store, no friction.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="cta-row"
            >
              <button className="btn-primary" onClick={() => router.push('/auth')}>
                Get started free
                <ArrowRight size={18} />
              </button>
              <button className="btn-secondary" onClick={() => router.push('/auth')}>
                I run a cafe
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <CardStack />
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

      {/* EDITORIAL FEATURES */}
      {EDITORIAL_FEATURES.map((feature, i) => (
        <section key={feature.num} style={{
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
                  color: 'var(--accent)',
                  letterSpacing: '-0.05em',
                  marginBottom: 24,
                  opacity: 0.15,
                  textShadow: '0 4px 32px oklch(0.76 0.14 78 / 0.4)',
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
                  textShadow: '0 2px 16px oklch(0 0 0 / 0.3)',
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
                {feature.visual === 'wallet' && (
                  <div style={{
                    position: 'relative',
                    width: 'min(90vw, 480px)',
                    height: 400,
                  }}>
                    {[
                      { isImage: true, imagePath: '/Card1.png', y: 0, rotate: -4 },
                      { isImage: true, imagePath: '/Card2.png', y: 70, rotate: 2 },
                      { color: 'oklch(0.22 0.08 260)', accent: 'oklch(0.65 0.18 260)', name: 'Roast & Co.', y: 140, rotate: -2 },
                    ].map((card, idx) => (
                      <div key={idx} style={{
                        position: 'absolute',
                        top: card.y,
                        left: '50%',
                        transform: `translateX(-50%) rotate(${card.rotate}deg)`,
                        width: '100%',
                        aspectRatio: '1.586',
                        borderRadius: 18,
                        background: card.isImage ? 'transparent' : card.color,
                        border: card.isImage ? 'none' : `2px solid ${card.accent}40`,
                        padding: card.isImage ? 0 : '20px 28px',
                        boxShadow: `0 ${16 + idx * 8}px ${40 + idx * 16}px oklch(0 0 0 / 0.6)`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        zIndex: 3 - idx,
                        overflow: 'hidden',
                      }}>
                        {card.isImage ? (
                          <img
                            src={card.imagePath}
                            alt="Loyalty card"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 18,
                            }}
                          />
                        ) : (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 18, fontWeight: 900, color: card.accent }}>{card.name}</span>
                              <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: `${card.accent}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <QrCode size={18} color={card.accent} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                              {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} style={{
                                  width: 32, height: 32, borderRadius: '50%',
                                  background: i < (idx + 1) * 2 ? card.accent : 'transparent',
                                  border: `2.5px solid ${card.accent}`,
                                }} />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {feature.visual === 'qr' && (
                  <div style={{
                    width: 'min(90vw, 380px)',
                    padding: 48,
                    borderRadius: 24,
                    background: 'var(--bg-elevated)',
                    border: '2px solid var(--border)',
                    boxShadow: '0 24px 64px oklch(0 0 0 / 0.7), 0 0 0 1px var(--accent-dim) inset',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 32,
                  }}>
                    <div style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 16,
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      <QrCode size={180} color="oklch(0.09 0.012 55)" strokeWidth={1.5} />
                      <div style={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--accent)',
                        color: 'var(--accent-text)',
                        padding: '8px 20px',
                        borderRadius: 20,
                        fontSize: 14,
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                      }}>
                        60s
                      </div>
                    </div>
                    <p style={{
                      fontSize: 15,
                      color: 'var(--text-secondary)',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}>
                      One-time QR • Expires in 60 seconds
                    </p>
                  </div>
                )}

                {feature.visual === 'flow' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                    width: 'min(90vw, 400px)',
                  }}>
                    {['Tap count', 'QR appears', 'Scan & done'].map((step, idx) => (
                      <div key={step} style={{
                        padding: '32px 36px',
                        borderRadius: 20,
                        background: 'var(--bg-elevated)',
                        border: '2px solid var(--border)',
                        borderLeft: `6px solid var(--accent)`,
                        boxShadow: '0 8px 24px oklch(0 0 0 / 0.4)',
                        transform: `translateX(${idx * 12}px)`,
                      }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 800,
                          letterSpacing: '0.12em',
                          color: 'var(--accent)',
                          marginBottom: 12,
                        }}>
                          STEP {idx + 1}
                        </div>
                        <div style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                        }}>
                          {step}
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
