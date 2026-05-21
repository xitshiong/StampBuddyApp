import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!profileData) {
        return NextResponse.redirect(`${origin}/auth/role`)
      }

      const profile = profileData as { role: 'customer' | 'merchant' }
      const dest = profile.role === 'merchant' ? 'merchant' : 'customer'
      return NextResponse.redirect(`${origin}/${dest}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
