export type AuthIntent = 'merchant' | 'customer'

export const AUTH_INTENT_COOKIE = 'sb_auth_intent'
const MAX_AGE_SECONDS = 600

export function isAuthIntent(value: string | null | undefined): value is AuthIntent {
  return value === 'merchant' || value === 'customer'
}

export function setAuthIntentCookie(intent: AuthIntent) {
  if (typeof document === 'undefined') return
  // ponytail: document.cookie — no js-cookie dep
  document.cookie = `${AUTH_INTENT_COOKIE}=${intent}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`
}

export function clearAuthIntentCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${AUTH_INTENT_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}
