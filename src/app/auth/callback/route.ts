import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        // New user — redirect to role selection
        return NextResponse.redirect(`${origin}/auth/role`)
      }

      // Existing user — route by role
      return NextResponse.redirect(`${origin}/${profile.role === 'merchant' ? 'merchant' : 'customer'}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
