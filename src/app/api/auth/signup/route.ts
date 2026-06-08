import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function cleanPhone(num: string): string {
  let clean = num.replace(/\s+/g, '').replace(/-/g, '')
  if (!clean.startsWith('+')) {
    if (clean.startsWith('60')) {
      clean = '+' + clean
    } else if (clean.startsWith('0')) {
      clean = '+60' + clean.substring(1)
    } else {
      clean = '+60' + clean
    }
  }
  return clean
}

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json()

    if (!phone || !pin) {
      return NextResponse.json({ error: 'Phone number and PIN are required' }, { status: 400 })
    }

    const cleanPhoneNumber = cleanPhone(phone)
    
    // Validate phone number format (at least 9 digits after +)
    if (cleanPhoneNumber.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    // Validate PIN (must be exactly 4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if phone number already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', cleanPhoneNumber)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ error: 'A user with this phone number is already registered' }, { status: 400 })
    }

    // Generate dummy email for Supabase Auth
    const email = `${cleanPhoneNumber.replace('+', '')}@stampbuddy.local`

    // Create user account with auto-confirm
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: pin,
      email_confirm: true,
      user_metadata: { role: 'customer' }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const user = authData.user
    if (!user) {
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 400 })
    }

    // Create profile entry for the customer
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: user.id,
      phone: cleanPhoneNumber,
      role: 'customer'
    })

    if (profileError) {
      // Clean up created auth user if profile creation fails to prevent orphaned auth accounts
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return NextResponse.json({ error: 'Failed to initialize customer profile' }, { status: 400 })
    }

    return NextResponse.json({ success: true, email })
  } catch (err: any) {
    console.error('Signup API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
