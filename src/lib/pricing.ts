export type PricingRegion = 'MY' | 'AU' | 'SG'

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
  /** Prefix shown before the amount (e.g. RM, A$, S$) */
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
  AU: {
    id: 'AU',
    label: 'Australia',
    currency: 'AUD',
    locale: 'en-AU',
    symbol: 'A$',
    plans: {
      starter: { priceMonthly: 29, priceAnnually: 24 },
      growth: { priceMonthly: 59, priceAnnually: 49 },
      pro: { priceMonthly: 109, priceAnnually: 89 },
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
}

export const PRICING_REGION_ORDER: PricingRegion[] = ['MY', 'AU', 'SG']

export const PRICING_REGION_COOKIE = 'stampbuddy-pricing-region'

export const PRICING_REGIONS_LIST = PRICING_REGION_ORDER.map((id) => PRICING_REGIONS[id])

export function countryToPricingRegion(countryCode: string | null | undefined): PricingRegion {
  if (countryCode === 'MY') return 'MY'
  if (countryCode === 'AU') return 'AU'
  if (countryCode === 'SG') return 'SG'
  return 'MY'
}

export function parsePricingRegion(value: string | null | undefined): PricingRegion | null {
  if (value === 'MY' || value === 'AU' || value === 'SG') return value
  // ponytail: legacy INTL/USD cookie maps to AU until it expires
  if (value === 'INTL') return 'AU'
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
