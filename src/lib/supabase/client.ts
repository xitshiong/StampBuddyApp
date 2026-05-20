import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Node v25 exposes a broken localStorage stub when --localstorage-file is not set.
// Force a safe no-op storage so Supabase auth never touches the broken global.
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { return window.localStorage.getItem(key) } catch { return null }
    }
    return null
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { window.localStorage.setItem(key, value) } catch {}
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { window.localStorage.removeItem(key) } catch {}
    }
  },
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: safeStorage,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  )
}
