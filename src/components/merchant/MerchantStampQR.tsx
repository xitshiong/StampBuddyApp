'use client'

import { QRCodeSVG } from 'qrcode.react'
import { RefreshCw } from 'lucide-react'

const QR_TTL = 60

/** Demo session UUID — encodes a real scannable-style QR for marketing previews */
export const DEMO_SESSION_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'

interface Props {
  sessionId: string
  stampCount: number
  timeLeft: number
  showNewButton?: boolean
  onNewQR?: () => void
}

export default function MerchantStampQR({
  sessionId,
  stampCount,
  timeLeft,
  showNewButton = false,
  onNewQR,
}: Props) {
  const pct = (timeLeft / QR_TTL) * 100
  const circ = 2 * Math.PI * 26
  const urgent = timeLeft <= 10

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
      <div style={{
        width: '100%',
        maxWidth: 360,
        padding: '28px 24px',
        borderRadius: 24,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-soft)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        boxShadow: '0 12px 40px var(--shadow-mid)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="live-dot" style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--success)',
              display: 'block',
            }} />
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--success)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              Live
            </span>
          </div>
          <span style={{
            padding: '3px 10px',
            borderRadius: 20,
            background: 'var(--accent-dim)',
            border: '1px solid oklch(0.50 0.16 28 / 0.25)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--accent)',
          }}>
            {stampCount} stamp{stampCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{
          padding: 16,
          borderRadius: 16,
          background: '#ffffff',
          boxShadow: '0 2px 20px var(--shadow-soft)',
        }}>
          <QRCodeSVG value={sessionId} size={200} level="H" bgColor="#ffffff" fgColor="#0f0e0a" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width={64} height={64} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
            <circle cx={32} cy={32} r={26} fill="none" stroke="var(--border)" strokeWidth={3.5} />
            <circle
              cx={32} cy={32} r={26} fill="none"
              stroke={urgent ? 'var(--error)' : 'var(--accent)'}
              strokeWidth={3.5}
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
            <text
              x={32} y={32}
              textAnchor="middle" dominantBaseline="central"
              style={{ transform: 'rotate(90deg)', transformOrigin: '32px 32px' }}
              fill={urgent ? 'var(--error)' : 'var(--text-primary)'}
              fontSize={13} fontWeight={800}
            >
              {timeLeft}s
            </text>
          </svg>
          <div>
            <p style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '-0.2px',
              color: urgent ? 'var(--error)' : 'var(--text-primary)',
              margin: 0,
            }}>
              {urgent ? 'Expiring soon!' : `Expires in ${timeLeft}s`}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, marginBottom: 0 }}>
              One-time scan only
            </p>
          </div>
        </div>
      </div>

      {showNewButton && onNewQR && (
        <button
          type="button"
          onClick={onNewQR}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '13px 22px',
            borderRadius: 14,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-soft)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <RefreshCw size={15} /> New QR
        </button>
      )}
    </div>
  )
}
