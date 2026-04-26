'use client'

import { useDashboardHref } from '@/hooks/useDashboardHref'

export default function CtaBand() {
  const ctaHref = useDashboardHref()
  return (
    <section style={{ padding: '0 5% 0', background: '#fff' }}>
      <div
        style={{
          position: 'relative',
          background: '#0f0f0f',
          borderRadius: 16,
          padding: '96px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 28,
          margin: '80px 0 80px',
          overflow: 'hidden',
        }}
      >
        {/* Background depth effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(42,42,42,0.9) 0%, rgba(15,15,15,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 40% at 20% -10%, rgba(38,38,38,0.6) 0%, rgba(15,15,15,0) 60%)',
            pointerEvents: 'none',
          }}
        />
        {/* Subtle curved line */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 1000 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path
            d="M-100,220 C200,80 400,320 700,140 C850,60 950,180 1100,100"
            stroke="rgba(255,255,255,0.035)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M-100,270 C150,130 450,350 750,180 C900,100 980,220 1100,160"
            stroke="rgba(255,255,255,0.025)"
            strokeWidth="1"
            fill="none"
          />
        </svg>

        {/* Content */}
        <h2
          style={{
            position: 'relative',
            margin: 0,
            font: '700 clamp(32px, 4vw, 56px)/1.06 var(--font-dm-sans), sans-serif',
            letterSpacing: '-0.03em',
            color: '#f0f0f0',
            maxWidth: 640,
          }}
        >
          Dein persönlicher{' '}
          <span style={{ color: '#b8921a' }}>Immobilien-Rechner.</span>
        </h2>

        <p
          style={{
            position: 'relative',
            margin: 0,
            font: '400 15px/1.6 var(--font-dm-sans), sans-serif',
            color: 'rgba(240,240,240,0.50)',
            maxWidth: 480,
          }}
        >
          Vom Inserat zur Rendite in unter einer Minute.
          Kostenlos starten, keine Kreditkarte nötig.
        </p>

        <a
          href={ctaHref}
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px',
            background: 'linear-gradient(to bottom, #3d3d3d, #141414)',
            color: '#ffffff',
            borderRadius: 8,
            font: '500 14px/1 var(--font-dm-sans), sans-serif',
            textDecoration: 'none',
            letterSpacing: '-0.1px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
            border: '1px solid rgba(0,0,0,0.5)',
            transition: 'opacity 150ms ease, box-shadow 150ms ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.opacity = '0.88'
            el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.4), 0 6px 16px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.opacity = '1'
            el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)'
          }}
        >
          Jetzt berechnen
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  )
}
