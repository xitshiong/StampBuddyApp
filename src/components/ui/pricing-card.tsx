'use client'

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from "lucide-react";

// --- Types ---
type BillingCycle = 'monthly' | 'annually';

interface Feature {
  name: string;
  isIncluded: boolean;
}

interface PriceTier {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnually: number; // yearly price per month (discounted)
  isPopular: boolean;
  buttonLabel: string;
  features: Feature[];
}

interface PricingComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  plans: [PriceTier, PriceTier, PriceTier];
  billingCycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
  onPlanSelect: (planId: string, cycle: BillingCycle) => void;
}

const FeatureItem: React.FC<{ feature: Feature }> = ({ feature }) => {
  const Icon = feature.isIncluded ? Check : X;
  
  return (
    <li style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '8px 0',
    }}>
      <div 
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
          background: feature.isIncluded ? 'var(--accent-dim)' : 'var(--bg-surface)',
          color: feature.isIncluded ? 'var(--accent)' : 'var(--text-muted)',
        }}
      >
        <Icon size={12} strokeWidth={3} />
      </div>
      <span style={{
        fontSize: 14,
        color: feature.isIncluded ? 'var(--text-primary)' : 'var(--text-muted)',
        lineHeight: 1.4,
      }}>
        {feature.name}
      </span>
    </li>
  );
};

export const PricingComponent: React.FC<PricingComponentProps> = ({
  plans,
  billingCycle,
  onCycleChange,
  onPlanSelect,
  className,
  ...props
}) => {
  const annualDiscountPercent = 17;

  // --- Toggle ---
  const CycleToggle = (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 72, marginTop: 16 }}>
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1.5px solid var(--border-soft)',
        borderRadius: 40,
        padding: 6,
        display: 'flex',
        gap: 6,
        boxShadow: 'inset 0 2px 8px var(--shadow-soft)'
      }}>
        <button
          onClick={() => onCycleChange('monthly')}
          style={{
            padding: '10px 24px',
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            background: billingCycle === 'monthly' ? 'var(--accent)' : 'transparent',
            color: billingCycle === 'monthly' ? 'var(--accent-text)' : 'var(--text-secondary)',
            boxShadow: billingCycle === 'monthly' ? '0 4px 12px var(--accent-dim)' : 'none',
          }}
          className="toggle-btn"
        >
          Monthly
        </button>
        <button
          onClick={() => onCycleChange('annually')}
          style={{
            padding: '10px 24px',
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            background: billingCycle === 'annually' ? 'var(--accent)' : 'transparent',
            color: billingCycle === 'annually' ? 'var(--accent-text)' : 'var(--text-secondary)',
            boxShadow: billingCycle === 'annually' ? '0 4px 12px var(--accent-dim)' : 'none',
          }}
          className="toggle-btn"
        >
          Annually
          <span style={{
            position: 'absolute',
            top: -12,
            right: -8,
            fontSize: 9,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--accent)',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--accent)',
            padding: '2px 8px',
            borderRadius: 20,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px var(--shadow-soft)'
          }}>
            Save {annualDiscountPercent}%
          </span>
        </button>
      </div>
    </div>
  );

  // --- Cards ---
  const PricingCards = (
    <div className="pricing-grid">
      {plans.map((plan) => {
        const isFeatured = plan.isPopular;
        const displayPrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnually;
        const totalBilled = billingCycle === 'annually' ? plan.priceAnnually * 12 : plan.priceMonthly;

        return (
          <div
            key={plan.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 'var(--r-card)',
              backgroundColor: 'var(--bg-surface)',
              border: isFeatured ? '2.5px solid var(--accent)' : '1.5px solid var(--border-soft)',
              padding: '40px 32px 32px',
              position: 'relative',
              boxShadow: isFeatured 
                ? '0 24px 56px var(--accent-dim)' 
                : '0 16px 40px var(--shadow-mid)',
              transform: isFeatured ? 'scale(1.04)' : 'scale(1)',
              zIndex: isFeatured ? 10 : 1,
              ['--hover-scale' as any]: isFeatured ? '1.05' : '1.02',
            }}
            className="pricing-card-el"
          >
            {isFeatured && (
              <span style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '5px 16px',
                borderRadius: 20,
                background: 'var(--accent)',
                color: 'var(--accent-text)',
                boxShadow: '0 4px 12px var(--accent-dim)',
                whiteSpace: 'nowrap',
              }}>
                Most Popular
              </span>
            )}

            <div style={{ marginBottom: 24 }}>
              <h3 style={{
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '-0.3px',
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}>
                {plan.name}
              </h3>
              <p style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                minHeight: 44,
              }}>
                {plan.description}
              </p>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  marginRight: 4,
                  alignSelf: 'center',
                }}>
                  RM
                </span>
                <span className="num" style={{
                  fontSize: 52,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  letterSpacing: '-1.5px',
                  lineHeight: 1,
                }}>
                  {displayPrice}
                </span>
                <span style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}>
                  /mo
                </span>
              </div>
              <p style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginTop: 8,
                fontWeight: 500,
              }}>
                {billingCycle === 'annually' 
                  ? `Billed annually (RM ${totalBilled.toLocaleString()}/yr)` 
                  : "Billed monthly, cancel anytime"
                }
              </p>
              {billingCycle === 'annually' && (
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: 'var(--accent)',
                    background: 'var(--accent-dim)',
                    padding: '3px 10px',
                    borderRadius: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    Save RM {((plan.priceMonthly - plan.priceAnnually) * 12).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div style={{ flexGrow: 1, marginBottom: 32 }}>
              <p style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: 16,
              }}>
                What's included:
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {plan.features.map((feature) => (
                  <FeatureItem key={feature.name} feature={feature} />
                ))}
              </ul>
            </div>

            <div>
              <button
                onClick={() => onPlanSelect(plan.id, billingCycle)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: 'var(--r-btn)',
                  fontSize: 14,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  border: isFeatured ? 'none' : '1.5px solid var(--border-soft)',
                  background: isFeatured ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: isFeatured ? 'var(--accent-text)' : 'var(--text-primary)',
                  transition: 'all 0.2s',
                }}
                className={isFeatured ? 'card-btn-popular' : 'card-btn-standard'}
              >
                {plan.buttonLabel}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // --- Comparison Table ---
  const comparisonFeatures = [
    { name: 'Active Loyalty Cards', values: ['1 Card', 'Up to 5 Cards', 'Unlimited Cards'] },
    { name: 'Locations Supported', values: ['1 Location', 'Up to 5 Locations', 'Unlimited Locations'] },
    { name: 'Stamps & Customer Scans', values: ['Unlimited', 'Unlimited', 'Unlimited'] },
    { name: 'QR Code Expiry Protection', values: [true, true, true] },
    { name: 'Basic Dashboards', values: [true, true, true] },
    { name: 'Customer Scan Analytics', values: ['Basic counter', 'Advanced Scan History & CSV', 'Advanced Scan History & CSV'] },
    { name: 'Card Color Themes', values: [true, true, true] },
    { name: 'Upload Logo & Banner', values: [false, true, true] },
    { name: 'Co-op Cross-store Campaigns', values: [false, false, true] },
    { name: 'Support Channels', values: ['Self-serve FAQ', 'Priority Email & Text', '1-on-1 Support & Setup'] },
  ];

  const ComparisonTable = (
    <div className="comparison-table-wrapper">
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-soft)' }}>
            <th style={{ padding: '20px 24px', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', width: '30%' }}>
              Compare Features
            </th>
            {plans.map((plan) => (
              <th
                key={plan.id}
                style={{
                  padding: '20px 24px',
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  background: plan.isPopular ? 'var(--accent-dim)' : 'transparent',
                }}
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonFeatures.map((feat) => (
            <tr key={feat.name} className="table-row" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                {feat.name}
              </td>
              {plans.map((plan, i) => {
                const val = feat.values[i];
                const isPopular = plan.isPopular;

                return (
                  <td
                    key={`${plan.id}-${feat.name}`}
                    style={{
                      padding: '16px 24px',
                      textAlign: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      background: isPopular ? 'var(--accent-dim)' : 'transparent',
                    }}
                  >
                    {typeof val === 'boolean' ? (
                      val ? (
                        <div style={{
                          display: 'inline-flex',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'var(--accent-dim)',
                          color: 'var(--accent)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <div style={{
                          display: 'inline-flex',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-muted)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <X size={14} strokeWidth={2.5} />
                        </div>
                      )
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>{val}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{
      width: '100%',
      padding: '80px clamp(24px, 5vw, 64px)',
      maxWidth: 1280,
      margin: '0 auto',
      boxSizing: 'border-box'
    }} {...props}>
      
      <style>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          width: 100%;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .pricing-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .pricing-card-el {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s;
        }
        .pricing-card-el:hover {
          transform: translateY(-8px) scale(var(--hover-scale, 1.02)) !important;
          box-shadow: 0 24px 48px var(--shadow-strong) !important;
        }
        .toggle-btn:hover {
          color: var(--text-primary) !important;
        }
        .card-btn-popular:hover {
          box-shadow: 0 12px 28px var(--accent-dim) !important;
          transform: translateY(-2px);
        }
        .card-btn-popular:active {
          transform: translateY(0);
        }
        .card-btn-standard:hover {
          background: var(--border-soft) !important;
          color: var(--text-primary) !important;
        }
        .comparison-table-wrapper {
          display: none;
          margin-top: 80px;
          border: 1.5px solid var(--border-soft);
          border-radius: 22px;
          overflow: hidden;
          background: var(--bg-surface);
          box-shadow: 0 16px 48px var(--shadow-mid);
        }
        @media (min-width: 768px) {
          .comparison-table-wrapper {
            display: block;
          }
        }
        .table-row {
          transition: background-color 0.2s;
        }
        .table-row:hover {
          background-color: var(--accent-dim) !important;
        }
      `}</style>

      <header style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 56px' }}>
        <div className="ruled-divider" style={{ margin: '0 auto 28px' }} />
        <h2 style={{
          fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
        }}>
          Simple, honest pricing for your business.
        </h2>
        <p style={{
          marginTop: 16,
          fontSize: 'clamp(15px, 2.2vw, 17px)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          Start with a 7-day free trial. One plan for every stage — from your first location to a full network.
        </p>
      </header>

      {CycleToggle}

      <section aria-labelledby="pricing-plans" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {PricingCards}
        <div style={{
          textAlign: 'center',
          marginTop: 40,
          fontSize: 'clamp(13px, 1.8vw, 15px)',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          background: 'var(--bg-elevated)',
          border: '1.5px solid var(--border-soft)',
          padding: '12px 28px',
          borderRadius: 30,
          boxShadow: '0 4px 12px var(--shadow-soft)',
        }}>
          7-day free trial on all plans. Cancel anytime. Setup takes under 2 minutes.
        </div>
      </section>

      <section aria-label="Detailed Feature Comparison">
        {ComparisonTable}
      </section>
    </div>
  );
};

const cafePlans: [PriceTier, PriceTier, PriceTier] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for independent local spots, services, and single-location shops.',
    priceMonthly: 59,
    priceAnnually: 49,
    isPopular: false,
    buttonLabel: 'Start free — no card needed',
    features: [
      { name: '1 active digital loyalty card', isIncluded: true },
      { name: '1 location terminal key', isIncluded: true },
      { name: 'Unlimited stamps & scans', isIncluded: true },
      { name: 'Live 60-second QR validation', isIncluded: true },
      { name: 'Basic stamp analytics dashboard', isIncluded: true },
      { name: 'Custom card colors & themes', isIncluded: true },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For growing neighborhood brands with up to 5 locations.',
    priceMonthly: 119,
    priceAnnually: 99,
    isPopular: true,
    buttonLabel: 'Start free trial',
    features: [
      { name: 'Up to 5 active cards & terminals', isIncluded: true },
      { name: 'Unlimited stamps & customer scans', isIncluded: true },
      { name: 'Multi-location shared customer profiles', isIncluded: true },
      { name: 'Advanced scan analytics & CSV export', isIncluded: true },
      { name: 'Custom store logo & banner uploads', isIncluded: true },
      { name: 'Priority email & text support', isIncluded: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For merchant associations or local business networks.',
    priceMonthly: 229,
    priceAnnually: 189,
    isPopular: false,
    buttonLabel: 'Talk to us',
    features: [
      { name: 'Unlimited loyalty cards & terminals', isIncluded: true },
      { name: 'Unlimited stamps & scans', isIncluded: true },
      { name: 'Cross-store community loyalty campaigns', isIncluded: true },
      { name: 'Co-op branding & configuration configs', isIncluded: true },
      { name: '1-on-1 merchant training & setup help', isIncluded: true },
      { name: 'Dedicated Support Account Manager', isIncluded: true },
    ],
  },
];

const ExampleComp = () => {
  const router = useRouter();
  const [cycle, setCycle] = React.useState<BillingCycle>('annually');

  const handleCycleChange = (newCycle: BillingCycle) => {
    setCycle(newCycle);
  };

  const handlePlanSelect = (planId: string, currentCycle: BillingCycle) => {
    if (planId === 'pro') {
      window.open('https://wa.me/601161665322?text=Hi%2C%20I%27m%20interested%20in%20StampBuddy%20for%20my%20business', '_blank');
    } else {
      router.push('/auth?intent=merchant');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <PricingComponent
        plans={cafePlans}
        billingCycle={cycle}
        onCycleChange={handleCycleChange}
        onPlanSelect={handlePlanSelect}
      />
    </div>
  );
};

export default ExampleComp;
