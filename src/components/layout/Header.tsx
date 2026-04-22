'use client'

import Link from 'next/link'

const NAV_LINKS = [
  ['Für Investoren', '#features'],
  ['Preise', '#'],
  ['Ressourcen', '#'],
  ['Firma', '#'],
] as const

export default function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
      }}
    >
      <div
        style={{
          padding: '0 48px',
          height: 68,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
        }}
      >
        {/* Logo — left */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            justifySelf: 'start',
          }}
        >
          <svg viewBox="0 0 120 100" width={22} height={18} aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
            <path d="M60,52 L28,84 L28,70 L60,38 L92,70 L92,84 Z" fill="#0a0a0a" />
            <path d="M52,32 L60,24 L100,24 L92,32 Z" fill="#0a0a0a" />
          </svg>
          <span
            style={{
              font: '500 20px/1 var(--font-dm-sans), sans-serif',
              color: '#0a0a0a',
              letterSpacing: '-0.4px',
            }}
          >
            brickscore
          </span>
        </Link>

        {/* Nav — center */}
        <nav
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 36,
          }}
        >
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              style={{
                font: '400 15px/1 var(--font-dm-sans), sans-serif',
                color: '#4a4a4a',
                textDecoration: 'none',
                letterSpacing: '-0.1px',
                transition: 'color 130ms ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0a0a0a' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#4a4a4a' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions — right */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 20,
            justifySelf: 'end',
          }}
        >
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '9px 18px',
              background: 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
              color: '#0a0a0a',
              borderRadius: 8,
              font: '500 14px/1 var(--font-dm-sans), sans-serif',
              textDecoration: 'none',
              border: '1px solid #d8d8d8',
              boxShadow: '0 1px 2px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)',
              transition: 'box-shadow 150ms ease, border-color 150ms ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 5px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)'
              e.currentTarget.style.borderColor = '#bbbbbb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)'
              e.currentTarget.style.borderColor = '#d8d8d8'
            }}
          >
            Anmelden
          </Link>

          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
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
              e.currentTarget.style.opacity = '0.88'
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.4), 0 6px 16px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)'
            }}
          >
            Kostenlos starten
          </Link>
        </div>
      </div>
    </header>
  )
}
