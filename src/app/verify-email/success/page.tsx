'use client'

import Link from 'next/link'
import AuthShell from '@/components/auth/AuthShell'

export default function VerifyEmailSuccessPage() {
  return (
    <AuthShell>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(31,138,101,0.10)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#1a6a45',
          }}
          aria-hidden="true"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ margin: 0, font: '700 32px/1.15 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
            E-Mail bestätigt
          </h1>
          <p style={{ margin: 0, font: '400 14px/1.55 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
            Dein Account ist freigeschaltet. Du kannst dich jetzt anmelden.
          </p>
        </div>
      </header>

      <Link
        href="/login"
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
        Zum Login
      </Link>
    </AuthShell>
  )
}
