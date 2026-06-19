'use client'

import { useEffect, useState } from 'react'
import MerchantStampQR, { DEMO_SESSION_ID } from './MerchantStampQR'

const QR_TTL = 60

/** Landing-page preview — matches live merchant QR with a ticking countdown */
export default function MerchantStampQRPreview({
  stampCount = 2,
  initialTimeLeft = 47,
}: {
  stampCount?: number
  initialTimeLeft?: number
}) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft)

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => (t <= 1 ? QR_TTL : t - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <MerchantStampQR
      sessionId={DEMO_SESSION_ID}
      stampCount={stampCount}
      timeLeft={timeLeft}
    />
  )
}
