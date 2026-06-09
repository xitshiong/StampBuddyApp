'use client'

import { useRouter } from 'next/navigation'
import StampBuddyLogo from '@/components/ui/Logo'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  const router = useRouter()

  return (
    <div style={{
      background: 'var(--bg-base)',
      minHeight: '100vh',
      color: 'var(--text-primary)',
      paddingTop: 120,
      paddingBottom: 80,
      paddingLeft: 'clamp(24px, 5vw, 80px)',
      paddingRight: 'clamp(24px, 5vw, 80px)',
      position: 'relative',
    }}>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(24px, 5vw, 80px)', height: 72,
        borderBottom: '1px solid var(--border-soft)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        background: 'oklch(0.09 0.012 55 / 0.92)',
      }}>
        <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
          <StampBuddyLogo size={32} />
        </div>
        <button 
          onClick={() => router.push('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 14, fontWeight: 700, padding: '10px 20px',
            borderRadius: 60, border: '1px solid var(--border-soft)',
            background: 'transparent', color: 'var(--text-primary)',
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.background = 'var(--accent-dim)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-soft)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </nav>

      {/* Main Container */}
      <main style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
        <header style={{ marginBottom: 48 }}>
          <div className="ruled-divider" style={{ margin: '0 0 24px 0', height: 4, background: 'var(--accent)', maxWidth: 80, borderRadius: 2 }} />
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            marginBottom: 16,
          }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
            Last Updated: June 8, 2026
          </p>
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 36, lineHeight: 1.7, fontSize: 16, color: 'var(--text-secondary)' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              1. Our Privacy Commitment
            </h2>
            <p>
              At StampBuddy, we respect your privacy. This Privacy Policy describes how we collect, use, and protect your personal information when you use our digital loyalty platform. We aim to collect only the minimum amount of data required to link customer loyalty cards, issue stamps, and manage merchant subscriptions.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              2. Information We Collect
            </h2>
            <p style={{ marginBottom: 12 }}>
              Depending on whether you use StampBuddy as a customer or a merchant, we collect the following data:
            </p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Authentication Data:</strong> When you sign in with Google or email, we receive your email address, name, and profile photo/avatar from the authentication provider. We do not store passwords.</li>
              <li><strong>Merchant Profiles:</strong> If you set up a business, we store your store name, description, voucher rewards, logo URL, shop banner URL, card design preferences (bg/accent colors, stamp shape), and PIN codes.</li>
              <li><strong>Scan & Transaction Logs:</strong> We store metadata about stamp collections (which cards hold stamps, stamp counts, timestamp of stamp scans, location of scans, voucher redemptions, and active active duration).</li>
              <li><strong>Device & Usage Data:</strong> We collect local storage details to maintain active user sessions, screen sizes, browser versions, and standard server logs.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              3. How We Use Your Information
            </h2>
            <p style={{ marginBottom: 12 }}>
              We use your information strictly for the following purposes:
            </p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>To initialize and host your digital loyalty wallet.</li>
              <li>To allow merchants to issue stamps via secure one-time QR codes.</li>
              <li>To prevent fraud, multiple scans of expired QR keys, or duplicate card exploits.</li>
              <li>To manage paid merchant subscription billing, renewals, and cancellations.</li>
              <li>To contact you regarding critical service updates, billing alerts, or security reports.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              4. Third-Party Service Providers (Subprocessors)
            </h2>
            <p style={{ marginBottom: 12 }}>
              We do not sell your personal data. We share data with reliable third-party infrastructure providers to run our system:
            </p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Supabase:</strong> We use Supabase for hosting our database, user table management, storage buckets (for logo/banner images), and account authentication. Your data is stored securely in their data centers.</li>
              <li><strong>Stripe:</strong> We use Stripe to process paid subscriptions and transaction billing for merchants. Stripe is the sole handler of merchant credit card and bank numbers; we do not store full financial payment numbers on our servers.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              5. Cookies & Local Storage
            </h2>
            <p>
              We use standard browser Local Storage instead of third-party tracking cookies. This data is used solely to maintain user authentication sessions (so customers do not have to sign in every single time they scan a cafe QR code) and to preserve theme settings. We do not use tracking or advertising cookies.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              6. Your Privacy Rights
            </h2>
            <p style={{ marginBottom: 12 }}>
              We provide complete control over your loyalty profiles:
            </p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Access:</strong> Customers can view all active loyalty cards in their wallet, and merchants can view all shop branding settings in their dashboard.</li>
              <li><strong>Branding Control:</strong> Merchants can edit, change, or delete their logo, banner, shop name, and description at any time.</li>
              <li><strong>Data Deletion:</strong> If you wish to delete your customer profile, database scan logs, or merchant account entirely from our Supabase servers, please contact us. Upon request, we will purge all identifiable records within 30 days.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              7. Security Measures
            </h2>
            <p>
              We use secure Hypertext Transfer Protocol (HTTPS) encryption for all database connections and application requests. Supabase databases employ Row-Level Security (RLS) policies, ensuring customers can only query cards belonging to their account ID and merchants can only update configurations for their own store owner ID.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              8. Changes to this Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time to align with legal updates or changes in database architecture. Any revisions will be published on this page with an updated modification date.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              9. Contact for Privacy Inquiries
            </h2>
            <p>
              If you have any questions about this Privacy Policy, your rights under GDPR/CCPA, or if you wish to request a data deletion, please email us at: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>privacy@stampbuddy.app</span>.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
