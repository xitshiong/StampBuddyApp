import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { AUTH_INTENT_COOKIE, isAuthIntent } from '@/lib/auth-intent'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
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
        const cookieStore = await cookies()
        const intent = cookieStore.get(AUTH_INTENT_COOKIE)?.value

        if (isAuthIntent(intent)) {
          const { error: upsertError } = await serviceClient.from('profiles').upsert({
            id: data.user.id,
            phone: data.user.email ?? data.user.id,
            role: intent,
          })

          if (upsertError) {
            return NextResponse.redirect(`${origin}/auth/role?intent=${intent}`)
          }

          const dest = intent === 'merchant' ? '/merchant/onboarding' : '/customer'
          const response = NextResponse.redirect(`${origin}${dest}`)
          response.cookies.set(AUTH_INTENT_COOKIE, '', { path: '/', maxAge: 0 })
          return response
        }

        return NextResponse.redirect(`${origin}/auth/role`)
      }

      const profile = profileData as { role: 'customer' | 'merchant' }
      const dest = profile.role === 'merchant' ? 'merchant' : 'customer'
      const response = NextResponse.redirect(`${origin}/${dest}`)
      response.cookies.set(AUTH_INTENT_COOKIE, '', { path: '/', maxAge: 0 })
      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
