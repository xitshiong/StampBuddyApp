export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import GoogleAuth from '@/components/auth/GoogleAuth'

export default function JoinPage() {
  return (
    <Suspense>
      <GoogleAuth variant="customer" />
    </Suspense>
  )
}
