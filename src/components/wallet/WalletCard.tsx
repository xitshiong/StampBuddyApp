'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { LoyaltyCardWithBusiness } from '@/types/database'
import StampGrid from './StampGrid'
import VoucherCard from './VoucherCard'

interface Props {
  card: LoyaltyCardWithBusiness
  isActive: boolean      // Is this card currently at the front of the stack?
  isExpanded: boolean    // Is this card currently in full-screen view?
  isAnotherExpanded: boolean // Is another card expanded right now?
  isLifting: boolean     // Is the user hovering/touching the front card?
  stackIndex: number     // 0 = front, 1 = middle, 2 = back
  onPointerDown: () => void
  onPointerUp: () => void
  onTap: () => void
  onStampsUpdated: (cardId: string, newStamps: number) => void
  preview?: boolean
}

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
const smoothEase = [0.16, 1, 0.3, 1] as [number, number, number, number]

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
  card, isActive, isExpanded, isAnotherExpanded, isLifting, stackIndex, 
  onPointerDown, onPointerUp, onTap, onStampsUpdated, preview = false,
}: Props) {
  const { businesses: biz } = card
  
  const isComplete = card.current_stamps >= biz.max_stamps
  const stampsLeft = biz.max_stamps - card.current_stamps
  
  // Use merchant branding or fallback
  const bg = biz.card_bg_color || '#1c1c1e'
  const accent = biz.card_accent_color || biz.color || '#956afa'
  const textClr = biz.card_text_color || getContrastYIQ(bg)
  const shape = biz.stamp_shape || 'circle'

  // Stack styling logic:
  // Apple Wallet stacks downwards in Y, but visually upwards in Z.
  const maxDisplayedCards = 3
  const baseOffset = (maxDisplayedCards - 1 - stackIndex) * 72
  
  // Active/Expand overrides
  let topOffset = baseOffset
  if (isExpanded) topOffset = 0
  else if (isAnotherExpanded) topOffset = 500 // push down
  else if (isActive && isLifting) topOffset = baseOffset - 10 // lift slightly

  const scale = (isExpanded || isActive) ? 1 : Math.max(0.9, 1 - stackIndex * 0.03)
  const brightness = (isExpanded || isActive) ? 1 : stackIndex === 1 ? 0.85 : 0.70

  const handleInteraction = () => {
    onTap()
  }

  return (
    <>
      <motion.div
        layout={!preview}
        onClick={handleInteraction}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        initial={false}
        animate={preview ? {
          opacity: 1,
          boxShadow: isExpanded
            ? '0 24px 48px var(--shadow-strong)'
            : '0 8px 24px var(--shadow-soft)',
        } : {
          y: isExpanded ? 0 : topOffset,
          scale: isExpanded ? 1 : scale,
          opacity: isAnotherExpanded ? 0 : 1,
          filter: `brightness(${brightness})`,
          zIndex: isExpanded ? 100 : 50 - stackIndex,
        }}
        transition={{ duration: preview ? 0.45 : 0.35, ease: preview ? smoothEase : ease }}
        style={{
          position: preview || isExpanded ? 'relative' : 'absolute',
          top: preview || isExpanded ? undefined : 0,
          left: preview || isExpanded ? undefined : 0,
          right: preview || isExpanded ? undefined : 0,
          height: preview ? undefined : (isExpanded ? 'auto' : 250),
          width: '100%',
          cursor: preview ? 'pointer' : (isExpanded ? 'default' : 'pointer'),
          borderRadius: 14,
          boxShadow: !preview && isActive && (isLifting || isExpanded) ? '0 24px 48px var(--shadow-strong)' : undefined,
          pointerEvents: isAnotherExpanded ? 'none' : 'auto',
          overflow: 'hidden',
          '--card-bg': bg,
          '--card-accent': accent,
          '--card-text-clr': textClr,
        } as React.CSSProperties}
        className="card"
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 14,
          transition: 'border-radius 0.35s ease',
        }}>
          {/* Card Face */}
          <div className="card-face" style={{
            flex: '1',
            background: 'var(--card-bg)',
            position: 'relative',
            padding: isExpanded ? 0 : '20px 0 0',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 14,
            minHeight: preview ? undefined : (isExpanded ? undefined : 250),
            transition: 'padding 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'relative', zIndex: 2,
              padding: isExpanded ? '24px 24px 0' : '0 24px',
            }}>
              {biz.logo_url ? (
                <>
                  <img src={biz.logo_url} alt={biz.name} style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
                  <h3 style={{
                    fontSize: 18, fontWeight: 700, color: 'var(--card-text-clr)',
                    margin: 0, letterSpacing: '-0.3px', opacity: 0.95
                  }}>
                    {biz.name}
                  </h3>
                </>
              ) : (
                <h3 style={{
                  fontSize: 22, fontWeight: 800, color: 'var(--card-text-clr)',
                  margin: 0, letterSpacing: '-0.5px'
                }}>
                  {biz.name}
                </h3>
              )}
            </div>

            <div style={{
              position: 'relative', zIndex: 2,
              marginTop: isExpanded ? 20 : 16,
              width: '100%',
              flex: 'none',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{
                width: '100%',
                aspectRatio: '16 / 9',
                flex: 'none',
                overflow: 'hidden',
                position: 'relative',
                background: 'color-mix(in srgb, var(--card-text-clr) 4%, transparent)',
                borderTop: (biz.banner_url || !isExpanded) ? 'none' : '2px dashed color-mix(in srgb, var(--card-text-clr) 15%, transparent)',
                borderBottom: (biz.banner_url || !isExpanded) ? 'none' : '2px dashed color-mix(in srgb, var(--card-text-clr) 15%, transparent)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}>
                {biz.banner_url ? (
                  <img
                    src={biz.banner_url}
                    alt={biz.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, color: 'var(--card-text-clr)' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--card-text-clr)',
                      opacity: 0.5,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                    }}>
                      Store Image
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stamp Grid & Actions — animate open in preview */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="expanded-content"
                  initial={preview ? { height: 0, opacity: 0 } : false}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={preview ? { height: 0, opacity: 0 } : undefined}
                  transition={{ duration: 0.45, ease: smoothEase }}
                  style={{ overflow: 'hidden' }}
                >
                {/* Stamp Grid */}
                <div style={{
                  position: 'relative', zIndex: 2,
                  marginTop: 20,
                  padding: '0 24px',
                }}>
                  <StampGrid current={card.current_stamps} max={biz.max_stamps} accentColor="var(--card-accent)" stampShape={shape} />
                </div>

                {/* Action button */}
                <div style={{ marginTop: 32, position: 'relative', zIndex: 2, padding: '0 24px 32px' }}>
                   {preview ? (
                    <p style={{
                      margin: 0,
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--card-text-clr)',
                      opacity: 0.75,
                    }}>
                      {biz.voucher_reward} · {biz.max_stamps} stamps
                    </p>
                  ) : isComplete ? (
                    <VoucherCard card={card} onRedeemed={(newStamps) => { onStampsUpdated(card.id, newStamps ?? 0); onTap() }} />
                  ) : (
                    <p style={{
                      margin: 0,
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--card-text-clr)',
                      opacity: 0.8,
                      lineHeight: 1.5,
                    }}>
                      {stampsLeft} more stamp{stampsLeft !== 1 ? 's' : ''} until {biz.voucher_reward}
                    </p>
                  )}
                </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  )
}
