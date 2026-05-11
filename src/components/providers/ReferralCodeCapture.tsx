'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { capturePendingReferralCode, claimPendingReferral, getPendingReferralCode } from '@/lib/referral-client'

export default function ReferralCodeCapture() {
  const { status } = useSession()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) capturePendingReferralCode(ref)
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    if (!getPendingReferralCode()) return
    void claimPendingReferral()
  }, [status])

  return null
}
