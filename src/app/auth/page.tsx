export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import GoogleAuth from '@/components/auth/GoogleAuth'

export default function AuthPage() {
  return (
    <Suspense>
      <GoogleAuth />
    </Suspense>
  )
}
