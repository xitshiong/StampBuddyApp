'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet, Compass } from 'lucide-react'

const tabs = [
  { href: '/customer',        label: 'Wallet',  Icon: Wallet   },
  { href: '/customer/search', label: 'Explore', Icon: Compass  },
]

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg-base)' }}>
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </main>

      {/* Tab bar */}
      <nav style={{
        display: 'flex',
        background: 'oklch(0.11 0.012 55 / 0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border-soft)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '11px 0 13px',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              textDecoration: 'none',
              transition: 'color 0.15s',
              gap: 4,
            }}>
              <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500,
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
