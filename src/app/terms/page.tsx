'use client'

import { useRouter } from 'next/navigation'
import StampBuddyLogo from '@/components/ui/Logo'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
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
        background: 'var(--bg-elevated)',
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
            Terms of Service
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
            Last Updated: June 8, 2026
          </p>
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 36, lineHeight: 1.7, fontSize: 16, color: 'var(--text-secondary)' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              1. Welcome to StampBuddy
            </h2>
            <p>
              By accessing or using the StampBuddy web application, PWA, or website (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. StampBuddy is a platform that allows local merchants to offer digital loyalty stamp cards to their customers.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              2. Accounts & Registration
            </h2>
            <p style={{ marginBottom: 12 }}>
              To collect stamps or manage a business on StampBuddy, you must register for an account using a third-party authentication method (such as Google Authentication).
            </p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Accuracy:</strong> You agree to provide accurate, current, and complete information during registration and to keep your account details updated.</li>
              <li><strong>Account Security:</strong> You are solely responsible for maintaining the confidentiality of your session tokens and login credentials. You are liable for any activity occurring under your account.</li>
              <li><strong>Eligibility:</strong> You must be at least 13 years of age to register as a customer, and at least 18 years of age (or the age of legal majority in your jurisdiction) to register a business.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              3. Loyalty Program & Stamp Mechanics
            </h2>
            <p style={{ marginBottom: 12 }}>
              StampBuddy provides the digital infrastructure to record stamps and redeem vouchers. The following terms govern loyalty programs:
            </p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>No Cash Value:</strong> Digital stamps, stamp cards, and completed vouchers collected through StampBuddy have zero cash value and cannot be exchanged for cash, sold, or transferred.</li>
              <li><strong>Merchant Responsibility:</strong> The individual merchant cafe or store is solely responsible for defining their reward rules (e.g. number of stamps needed, reward items) and for fulfilling the voucher reward (e.g. providing a free coffee). StampBuddy is not responsible for a merchant's refusal to fulfill a reward.</li>
              <li><strong>Voucher Expiration:</strong> Active redeemed vouchers have a live countdown. Cashiers must verify the live timer. Vouchers that expire before redemption are void, and it is at the merchant's sole discretion whether to replace them.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              4. Merchant Fees & Subscriptions
            </h2>
            <p style={{ marginBottom: 12 }}>
              Merchants must choose a subscription plan to list their business and offer active loyalty cards.
            </p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Free Trial:</strong> We offer a 7-day free trial for new merchants. No credit card is required to sign up. At the end of the trial, you must choose a paid plan to keep your cards active.</li>
              <li><strong>Billing & Cancellation:</strong> Subscriptions are billed in advance on a recurring monthly or annual basis depending on your choice. You may cancel your subscription at any time; your access will continue until the end of the paid billing period.</li>
              <li><strong>Refunds:</strong> All merchant payments are final and non-refundable, except as required by law. We do not provide refunds or credits for partial subscription months or unused locations.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              5. Acceptable Use & Conduct
            </h2>
            <p style={{ marginBottom: 12 }}>
              You agree not to engage in any activity that cheats or disrupts the loyalty stamp process:
            </p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Customers:</strong> You must not attempt to manipulate QR code URLs, duplicate validation keys, spoof GPS locations, or exploit software bugs to accumulate stamps fraudulently.</li>
              <li><strong>Merchants:</strong> You must keep your merchant PIN code confidential. You must not issue stamps fraudulently or collect payments for stamps that do not correspond to authentic customer purchases.</li>
              <li><strong>System Abuse:</strong> You must not attempt to breach security, overload servers, scrape customer profiles, or inject malicious scripts into StampBuddy.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              6. Disclaimers of Warranties
            </h2>
            <p>
              StampBuddy is provided on an "as-is" and "as-available" basis. We make no warranties, express or implied, regarding the reliability, uptime, speed, accuracy, or suitability of the service. We do not guarantee that customer stamp histories or merchant data will never be lost due to server failures, database corruption, or database migrations, though we employ standard backup protocols.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              7. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, StampBuddy, its founders, and contractors shall not be liable for any direct, indirect, incidental, or consequential damages resulting from (a) your use of or inability to use the Service; (b) customer-merchant disputes regarding stamp collection or reward redemption; (c) lost customer loyalty cards, expired vouchers, or merchant closures; or (d) unauthorized access to your database profile.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              8. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account (customer or merchant) at any time, without prior notice, if we believe you have violated these Terms, engaged in fraudulent activity, or fail to pay merchant subscription fees.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              9. Changes to Terms
            </h2>
            <p>
              We may revise these Terms from time to time. The most current version will always be posted on this page. By continuing to access the Service after changes become effective, you agree to be bound by the revised Terms.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              10. Contact Us
            </h2>
            <p>
              For legal questions, disputes, or account terms inquiries, please contact us at: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>hello@stampbuddy.app</span>.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
