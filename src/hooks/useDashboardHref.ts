'use client'

import { useSession } from 'next-auth/react'

/**
 * Returns the right destination for landing-page CTAs:
 * authenticated → /dashboard, otherwise → /login with callbackUrl=/dashboard.
 * While the session is still loading we optimistically point to /login —
 * the login page itself bounces a logged-in user straight to /dashboard.
 */
export function useDashboardHref(): string {
  const { status } = useSession()
  return status === 'authenticated' ? '/dashboard' : '/login?callbackUrl=/dashboard'
}
