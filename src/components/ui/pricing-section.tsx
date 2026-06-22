import { cookies, headers } from 'next/headers'
import { PRICING_REGION_COOKIE, resolvePricingRegion } from '@/lib/pricing'
import PricingSection from '@/components/ui/pricing-card'

export default async function PricingSectionWithRegion() {
  const cookieStore = await cookies()
  const headersList = await headers()

  const region = resolvePricingRegion(
    cookieStore.get(PRICING_REGION_COOKIE)?.value,
    headersList.get('x-vercel-ip-country')
  )

  return <PricingSection initialRegion={region} />
}
