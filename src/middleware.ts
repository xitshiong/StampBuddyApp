import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { PRICING_REGION_COOKIE, countryToPricingRegion } from '@/lib/pricing'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Auto-detect pricing region from Vercel geo header on first visit.
  // Only set the cookie if the visitor hasn't already chosen a region
  // (the region selector overrides this everywhere).
  if (!request.cookies.has(PRICING_REGION_COOKIE)) {
    const region = countryToPricingRegion(request.headers.get('x-vercel-ip-country'))
    response.cookies.set(PRICING_REGION_COOKIE, region, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
