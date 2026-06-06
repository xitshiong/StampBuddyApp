import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Use service-role client to bypass RLS for the profile lookup.
      // The anon client's auth.uid() may not be set yet in this context,
      // which causes the RLS policy to block the read and always return null.
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )

      const { data: profileData } = await serviceClient
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
