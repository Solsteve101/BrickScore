'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import AuthShell from '@/components/auth/AuthShell'

type Reason = 'expired' | 'invalid' | 'used'

const MESSAGES: Record<Reason, { headline: string; body: string; showResend: boolean }> = {
  expired: {
    headline: 'Link abgelaufen',
    body: 'Dein Bestätigungs-Link ist nicht mehr gültig. Fordere einen neuen Link an, um deinen Account freizuschalten.',
    showResend: true,
  },
  invalid: {
    headline: 'Link ungültig',
    body: 'Wir konnten diesen Bestätigungs-Link nicht erkennen. Stelle sicher, dass du den Link vollständig kopiert hast.',
    showResend: false,
  },
  used: {
    headline: 'Link bereits verwendet',
    body: 'Dieser Bestätigungs-Link wurde bereits eingelöst. Falls deine E-Mail dennoch nicht bestätigt ist, fordere einen neuen Link an.',
    showResend: true,
  },
}

function ErrorInner() {
  const params = useSearchParams()
  const reasonRaw = (params.get('reason') ?? '').toLowerCase()
  const reason: Reason = (['expired', 'invalid', 'used'] as const).includes(reasonRaw as Reason)
    ? (reasonRaw as Reason)
    : 'invalid'
  const email = (params.get('email') ?? '').trim()
  const cfg = MESSAGES[reason]

  const pendingHref = email
    ? `/verify-email/pending?email=${encodeURIComponent(email)}`
    : '/verify-email/pending'

  return (
    <AuthShell>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(207,45,86,0.08)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#cf2d56',
          }}
          aria-hidden="true"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ margin: 0, font: '700 32px/1.15 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
            {cfg.headline}
          </h1>
          <p style={{ margin: 0, font: '400 14px/1.55 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
            {cfg.body}
          </p>
        </div>
      </header>

      {cfg.showResend && (
        <Link
          href={pendingHref}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '13px 16px',
            background: 'linear-gradient(to bottom, #3d3d3d, #141414)',
            color: '#ffffff', borderRadius: 10, border: '1px solid rgba(0,0,0,0.5)',
            font: '500 14.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: '-0.1px',
            textDecoration: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          Neue Mail anfordern
        </Link>
      )}

      <p style={{ margin: 0, textAlign: 'center', font: '400 13.5px/1 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
        <Link href="/login" style={{ color: '#0a0a0a', fontWeight: 500, textDecoration: 'none' }}>
          Zurück zum Login
        </Link>
      </p>
    </AuthShell>
  )
}

export default function VerifyEmailErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorInner />
    </Suspense>
  )
}
