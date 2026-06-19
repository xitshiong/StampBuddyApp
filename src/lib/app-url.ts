/** Canonical app origin — set NEXT_PUBLIC_APP_URL=https://stampbuddy.store in production. */
export function getAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (configured) return configured

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}

export function appUrl(path: string): string {
  const base = getAppOrigin()
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
