import LandingPage from './landing-page'
import PricingSectionWithRegion from '@/components/ui/pricing-section'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return <LandingPage pricingSection={<PricingSectionWithRegion />} />
}
