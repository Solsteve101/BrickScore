'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Sidebar from './Sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { status } = useSession()
  // Once we've been authenticated, stay mounted across transient 'loading'
  // states (e.g. while useSession().update() refetches the session).
  // Otherwise the entire subtree unmounts and any local state — open
  // accordions, form inputs, modals — gets reset.
  const hasBeenAuthed = useRef(false)
  if (status === 'authenticated') hasBeenAuthed.current = true

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/dashboard')
    }
  }, [status, router])

  const showSpinner =
    status === 'unauthenticated' ||
    (status === 'loading' && !hasBeenAuthed.current)
  if (showSpinner) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#7a7a7a', font: '500 13.5px/1 var(--font-dm-sans), sans-serif' }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ animation: 'vestora-spin 0.9s linear infinite' }}>
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Lädt…
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#fafafa' }}>
      <Sidebar />
      <main className="bs-dashboard-main" style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto' }}>{children}</main>
      <MobileBottomNav />
    </div>
  )
}
