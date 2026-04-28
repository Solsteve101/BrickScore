'use client'

import { useSession } from 'next-auth/react'

/**
 * Returns the right destination for landing-page CTAs:
 * authenticated → /dashboard/new, otherwise → /login with callbackUrl=/dashboard/new.
 * While the session is still loading we optimistically point to /login —
 * the login page itself bounces a logged-in user straight to /dashboard/new.
 */
export function useDashboardHref(): string {
  const { status } = useSession()
  return status === 'authenticated' ? '/dashboard/new' : '/login?callbackUrl=/dashboard/new'
}
