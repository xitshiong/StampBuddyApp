export type PricingRegion = 'MY' | 'SG' | 'INTL'

export type PlanId = 'starter' | 'growth' | 'pro'

export type BillingCycle = 'monthly' | 'annually'

export interface PlanPricing {
  priceMonthly: number
  priceAnnually: number
}

export interface RegionPricingConfig {
  id: PricingRegion
  label: string
  currency: string
  locale: string
  /** Prefix shown before the amount (e.g. RM, S$, $) */
  symbol: string
  plans: Record<PlanId, PlanPricing>
}

/** Edit prices here — this file is the single source of truth for the website. */
export const PRICING_REGIONS: Record<PricingRegion, RegionPricingConfig> = {
  MY: {
    id: 'MY',
    label: 'Malaysia',
    currency: 'MYR',
    locale: 'en-MY',
    symbol: 'RM',
    plans: {
      starter: { priceMonthly: 59, priceAnnually: 49 },
      growth: { priceMonthly: 119, priceAnnually: 99 },
      pro: { priceMonthly: 229, priceAnnually: 189 },
    },
  },
  SG: {
    id: 'SG',
    label: 'Singapore',
    currency: 'SGD',
    locale: 'en-SG',
    symbol: 'S$',
    plans: {
      starter: { priceMonthly: 29, priceAnnually: 24 },
      growth: { priceMonthly: 59, priceAnnually: 49 },
      pro: { priceMonthly: 109, priceAnnually: 89 },
    },
  },
  INTL: {
    id: 'INTL',
    label: 'International',
    currency: 'USD',
    locale: 'en-US',
    symbol: '$',
    plans: {
      starter: { priceMonthly: 19, priceAnnually: 15 },
      growth: { priceMonthly: 39, priceAnnually: 32 },
      pro: { priceMonthly: 79, priceAnnually: 65 },
    },
  },
}

export const PRICING_REGION_COOKIE = 'stampbuddy-pricing-region'

export const PRICING_REGIONS_LIST = Object.values(PRICING_REGIONS)

export function countryToPricingRegion(countryCode: string | null | undefined): PricingRegion {
  if (countryCode === 'MY') return 'MY'
  if (countryCode === 'SG') return 'SG'
  return 'INTL'
}

export function parsePricingRegion(value: string | null | undefined): PricingRegion | null {
  if (value === 'MY' || value === 'SG' || value === 'INTL') return value
  return null
}

export function resolvePricingRegion(
  cookieRegion: string | null | undefined,
  countryCode: string | null | undefined
): PricingRegion {
  return parsePricingRegion(cookieRegion) ?? countryToPricingRegion(countryCode)
}

export function formatMoney(amount: number, region: PricingRegion): string {
  const { locale, currency } = PRICING_REGIONS[region]
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatMoneyCompact(amount: number, region: PricingRegion): string {
  const { symbol } = PRICING_REGIONS[region]
  return `${symbol}${amount.toLocaleString(PRICING_REGIONS[region].locale)}`
}

export function annualSavings(plan: PlanPricing, region: PricingRegion): number {
  return (plan.priceMonthly - plan.priceAnnually) * 12
}

export function annualDiscountPercent(plan: PlanPricing): number {
  if (plan.priceMonthly <= 0) return 0
  return Math.round(((plan.priceMonthly - plan.priceAnnually) / plan.priceMonthly) * 100)
}
