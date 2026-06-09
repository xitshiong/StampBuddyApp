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
    title: 'Turn one-time visitors into regulars',
    body: "Customers who collect stamps come back to complete their card. StampBuddy runs entirely from your phone — no hardware, no POS integration, no IT setup. You're live in under 2 minutes.",
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
          box-shadow: 0 24px 48px oklch(0 0 0 / 0.8) !important;
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
        background: 'oklch(0.09 0.012 55 / 0.92)',
      }}>
        <StampBuddyLogo size={32} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
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
            For merchants
          </a>
          <button className="btn-primary" onClick={() => router.push('/auth')} style={{ padding: '0.7em 1.8em', fontSize: 14, minHeight: 44 }}>
            Get started
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
              Your stamps, finally in one place
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
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div className="cta-row">
                <button className="btn-primary" onClick={() => router.push('/auth')}>
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
                7-day free trial • No credit card required • Set up in under 2 minutes
              </p>
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

      {/* MERCHANT HERO CALLOUT */}
      <section style={{
        padding: '20px clamp(24px, 5vw, 80px) 40px',
        maxWidth: 1440,
        margin: '0 auto',
      }}>
        <SectionReveal>
          <div style={{
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(26,18,12,0.85) 100%)',
            border: '1px solid var(--border-soft)',
            borderRadius: 28,
            padding: 'clamp(40px, 6vw, 72px) clamp(24px, 5vw, 64px)',
            display: 'grid',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            position: 'relative',
            overflow: 'hidden',
          }} className="merchant-hero-grid">
            {/* Ambient gold glow in corner */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '60%',
              aspectRatio: '1',
              borderRadius: '50%',
              background: 'radial-gradient(circle, oklch(0.76 0.14 78 / 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            
            <div style={{ maxWidth: 680 }}>
              <div style={{
                fontSize: 12, fontWeight: 900, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16
              }}>
                For Business Owners
              </div>
              <h2 style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                color: 'var(--text-primary)',
                marginBottom: 20,
              }}>
                Bring customers back.<br />Without the paper.
              </h2>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}>
              <p style={{
                fontSize: 'clamp(15px, 2.2vw, 17px)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                margin: 0,
                fontWeight: 500,
              }}>
                Set up a digital loyalty card for your cafe in under 2 minutes. No hardware. No app for your customers to download. No monthly contract to start.
              </p>
              
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="btn-primary" onClick={() => router.push('/auth')}>
                  Get started free
                  <ArrowRight size={18} />
                </button>
                <a
                  href="https://wa.me/601161665322?text=Hi%2C%20I%27m%20interested%20in%20StampBuddy%20for%20my%20cafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  Ask a question
                </a>
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section style={{
        padding: '0 clamp(24px, 5vw, 80px) 80px',
        textAlign: 'center',
      }}>
        <SectionReveal>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}>
            <p style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: 0,
            }}>
              Trusted by cafes in Subang Jaya & KL
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(24px, 5vw, 48px)',
              opacity: 0.5,
              padding: '8px 0',
            }}>
              {['Roast & Co.', 'Kopi & Co.', 'Subang Coffee Co.', 'The Brew Bar', 'Merchant’s Cup'].map((cafe) => (
                <div key={cafe} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.3px',
                }}>
                  <span style={{ fontSize: 16 }}>☕</span>
                  <span>{cafe}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>
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
                  color: 'transparent',
                  WebkitTextStroke: '2px oklch(0.76 0.14 78 / 0.35)',
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
                    gap: 20,
                    width: 'min(90vw, 400px)',
                  }}>
                    {['Tap count', 'QR appears', 'Scan & done'].map((step, idx) => (
                      <div key={step} style={{
                        padding: '24px 28px',
                        borderRadius: 18,
                        background: 'var(--bg-elevated)',
                        border: '1.5px solid var(--border-soft)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20,
                      }}
                      className="flow-step-card"
                      >
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          border: '1.5px solid var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: 16,
                          fontWeight: 800,
                          flexShrink: 0,
                          background: 'var(--accent-dim)',
                        }}>
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            marginBottom: 4,
                          }}>
                            Step {idx + 1}
                          </div>
                          <div style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.3px',
                          }}>
                            {step}
                          </div>
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
            <FaqRow q="Does the customer need to create an account?" a="Yes, a quick sign-in with Google takes about 10 seconds. No forms, no passwords." />
            <FaqRow q="What if the QR expires before the customer scans?" a="The merchant taps a button to generate a fresh one. Takes one second." />
            <FaqRow q="Can one customer follow multiple cafes?" a="Yes. Each cafe gets its own loyalty card in the customer's wallet." />
            <FaqRow q="Is there a limit on how many stamps a card can hold?" a="Merchants set this when creating their business, anywhere from 1 to 20 stamps per card." />
            <FaqRow q="Is StampBuddy free for customers?" a="Yes, completely free. Customers can follow as many cafes as they like, collect stamps, and redeem rewards without ever paying." />
            <FaqRow q="How does the 7-day free trial work for merchants?" a="Merchants get full access to all features of their selected plan for 7 days without entering a credit card. At the end of the trial, choose the plan that best fits your business." />
          </div>
        </SectionReveal>
      </section>

      {/* CLOSING CTA */}
      <section style={{
        padding: 'clamp(80px, 12vh, 120px) clamp(24px, 5vw, 80px)',
        textAlign: 'center',
        background: 'linear-gradient(180deg, transparent, rgba(26,18,12,0.4))',
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
              <button className="btn-primary" onClick={() => router.push('/auth')}>
                Start 7-day free trial
                <ArrowRight size={18} />
              </button>
              <a
                href="https://wa.me/601161665322?text=Hi%2C%20I%27m%20interested%20in%20StampBuddy%20for%20my%20cafe"
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
            Made for neighbourhood cafes
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Free for customers • Paid plans for merchants
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
        href="https://wa.me/601161665322?text=Hi%2C%20I%27m%20interested%20in%20StampBuddy%20for%20my%20cafe"
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
