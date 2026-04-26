'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '45fr 55fr',
        background: '#ffffff',
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .v-auth-left { display: none !important; }
          .v-auth-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* LEFT — dark brand panel */}
      <aside
        className="v-auth-left"
        style={{
          position: 'relative',
          background: '#1C1C1C',
          color: '#f7f7f4',
          padding: '40px 48px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        {/* Subtle wave lines */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 1000 1200"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path
            d="M-100,300 C200,140 500,460 800,260 C950,160 1100,320 1200,200"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M-100,520 C150,360 450,640 750,460 C900,360 1050,520 1200,420"
            stroke="rgba(255,255,255,0.025)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M-100,820 C200,660 500,940 800,760 C950,660 1100,820 1200,720"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>

        {/* Top: back link + brand */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 64 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(247,247,244,0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              textDecoration: 'none',
              font: '500 13px/1 var(--font-dm-sans), sans-serif',
              alignSelf: 'flex-start',
              transition: 'background 150ms ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Zurück zur Startseite
          </Link>
        </div>

        {/* Bottom: brand + slogan + footer */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <svg viewBox="0 0 120 100" width={28} height={23} aria-hidden="true">
                <path d="M60,52 L28,84 L28,70 L60,38 L92,70 L92,84 Z" fill="#f7f7f4" />
                <path d="M52,32 L60,24 L100,24 L92,32 Z" fill="#f7f7f4" />
              </svg>
              <span style={{ font: '500 22px/1 var(--font-dm-sans), sans-serif', color: '#f7f7f4', letterSpacing: '-0.4px' }}>
                brickscore
              </span>
            </div>
            <p style={{ margin: 0, maxWidth: 360, font: '400 14.5px/1.55 var(--font-dm-sans), sans-serif', color: 'rgba(247,247,244,0.6)' }}>
              Der präzise Immobilien-Rechner für den deutschen Markt — speichere deine Deals, vergleiche sie und triff bessere Entscheidungen.
            </p>
          </div>

          <div style={{ display: 'inline-flex', gap: 22, font: '400 12.5px/1 var(--font-dm-sans), sans-serif', color: 'rgba(247,247,244,0.45)' }}>
            <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link>
            <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</Link>
            <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Support</Link>
          </div>
        </div>
      </aside>

      {/* RIGHT — form panel */}
      <main
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          background: '#ffffff',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
