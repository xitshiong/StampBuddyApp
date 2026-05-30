'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LoyaltyCardWithBusiness } from '@/types/database'
import StampGrid from './StampGrid'
import QRScanner from './QRScanner'
import VoucherCard from './VoucherCard'

interface Props {
  card: LoyaltyCardWithBusiness
  isActive: boolean      // Is this card currently at the front of the stack?
  isExpanded: boolean    // Is this card currently in full-screen view?
  isLifting: boolean     // Is the user hovering/touching the front card?
  stackIndex: number     // 0 = front, 1 = middle, 2 = back
  onPointerDown: () => void
  onPointerUp: () => void
  onTap: () => void
  onExpand: () => void
  onStampsUpdated: (cardId: string, newStamps: number) => void
}

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

// Helper for contrast
function getContrastYIQ(hexcolor: string){
    hexcolor = hexcolor.replace("#", "");
    if (hexcolor.length === 3) hexcolor = hexcolor.split('').map(c => c+c).join('');
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#111111' : '#ffffff';
}

export default function WalletCard({ 
  card, isActive, isExpanded, isLifting, stackIndex, 
  onPointerDown, onPointerUp, onTap, onExpand, onStampsUpdated 
}: Props) {
  const [showScanner, setShowScanner] = useState(false)
  const { businesses: biz } = card
  
  const isComplete = card.current_stamps >= biz.max_stamps
  const stampsLeft = biz.max_stamps - card.current_stamps
  
  // Use merchant branding or fallback
  const bg = biz.card_bg_color || '#1c1c1e'
  const accent = biz.card_accent_color || biz.color || '#956afa'
  const textClr = biz.card_text_color || getContrastYIQ(bg)
  const pattern = biz.card_pattern || ''
  const shape = biz.stamp_shape || 'circle'

  // Apple Wallet Stack positioning logic
  // Base offset is 20px per layer. If lifting, background layers spread by +4px
  const baseOffset = stackIndex * 20
  const fanOffset = (isLifting && stackIndex > 0) ? 4 : 0
  
  // If lifting, the front card goes UP by 18px. If not active, it sits in stack.
  const liftOffset = (isActive && isLifting && !isExpanded) ? -18 : 0
  
  const topOffset = isActive ? liftOffset : (baseOffset + fanOffset)
  const scale = isActive ? 1 : Math.max(0.9, 1 - stackIndex * 0.03)
  const brightness = isActive ? 1 : stackIndex === 1 ? 0.85 : 0.70

  const handleInteraction = () => {
    if (isExpanded) return // Close is handled by the close button
    if (!isActive) onTap()
    else onExpand()
  }

  return (
    <>
      <motion.div
        layout
        onClick={handleInteraction}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        initial={false}
        animate={{
          y: isExpanded ? 0 : topOffset,
          scale: isExpanded ? 1 : scale,
          filter: `brightness(${brightness})`,
          zIndex: isExpanded ? 100 : 50 - stackIndex,
        }}
        transition={{ duration: 0.35, ease }}
        style={{
          position: isExpanded ? 'fixed' : 'absolute',
          top: isExpanded ? 0 : 0,
          left: isExpanded ? 0 : 0,
          right: isExpanded ? 0 : 0,
          bottom: isExpanded ? 0 : 'auto',
          height: isExpanded ? '100dvh' : 240, 
          width: '100%',
          cursor: isExpanded ? 'default' : 'pointer',
          borderRadius: isExpanded ? 0 : 14,
          boxShadow: isActive && isLifting && !isExpanded ? '0 24px 48px rgba(0,0,0,0.25)' : 'none',
          '--card-bg': bg,
          '--card-accent': accent,
          '--card-text-clr': textClr,
          '--card-pattern': pattern,
        } as React.CSSProperties}
        className="card"
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflowY: isExpanded ? 'auto' : 'hidden',
          overflowX: 'hidden',
          borderRadius: isExpanded ? 0 : 14,
          transition: 'border-radius 0.35s ease',
        }}>
          {/* Top Section (Card Face) */}
          <div className="card-face" style={{
            flex: isExpanded ? '1' : '0 0 55%',
            background: 'var(--card-bg)',
            position: 'relative',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            borderTopLeftRadius: isExpanded ? 0 : 14,
            borderTopRightRadius: isExpanded ? 0 : 14,
          }}>
            {/* Optional Pattern */}
            {pattern && (
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.15,
                backgroundImage: `url(${pattern})`, backgroundSize: 'cover', pointerEvents: 'none'
              }} />
            )}
            
            {/* Merchant Logo or Name placeholder */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {biz.logo_url ? (
                <img src={biz.logo_url} alt={biz.name} style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
              ) : (
                <h3 style={{
                  fontSize: 22, fontWeight: 800, color: 'var(--card-text-clr)',
                  margin: 0, letterSpacing: '-0.5px'
                }}>
                  {biz.name}
                </h3>
              )}
            </div>

            {/* Stamp Grid */}
            <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto', paddingTop: 20 }}>
              <StampGrid current={card.current_stamps} max={biz.max_stamps} accentColor="var(--card-accent)" stampShape={shape} />
            </div>
            
            {isExpanded && (
              <div style={{ marginTop: 40, position: 'relative', zIndex: 2 }}>
                 {isComplete ? (
                  <VoucherCard card={card} onRedeemed={() => { onStampsUpdated(card.id, 0); onTap() }} />
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); setShowScanner(true) }}
                    style={{
                      width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                      background: 'var(--card-accent)', color: '#fff',
                      fontWeight: 700, fontSize: 16, cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }}
                  >
                    Scan QR to Stamp
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Section (Card Desc) */}
          <div className="card-desc" style={{
            flex: isExpanded ? '0 0 auto' : '0 0 45%',
            background: 'color-mix(in srgb, var(--card-bg) 60%, #000)',
            position: 'relative',
            top: -10,
            padding: isExpanded ? '24px 24px 100px 24px' : '24px 24px',
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            zIndex: 3,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--card-text-clr)', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isComplete ? 'Reward Ready' : `${stampsLeft} stamps to go`}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: 16, fontWeight: 600, color: 'var(--card-text-clr)' }}>
                  {biz.voucher_reward}
                </p>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '6px 12px',
                borderRadius: 20,
                color: 'var(--card-text-clr)',
                fontWeight: 800,
                fontSize: 14,
              }}>
                {card.current_stamps} / {biz.max_stamps}
              </div>
            </div>
            {isExpanded && (
               <button
                  onClick={e => { e.stopPropagation(); onTap() }} // Tap to close
                  style={{
                    marginTop: 20, width: '100%', padding: '12px', borderRadius: 20,
                    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--card-text-clr)',
                    fontWeight: 600, cursor: 'pointer'
                  }}
               >
                 Close
               </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showScanner && (
          <QRScanner
            card={card}
            onClose={() => setShowScanner(false)}
            onSuccess={newStamps => {
              onStampsUpdated(card.id, newStamps ?? card.current_stamps)
              setShowScanner(false)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
