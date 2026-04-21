'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: scrolled ? 'rgba(242,241,237,0.88)' : 'rgba(242,241,237,0.72)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(38,37,30,0.08)' : 'transparent'}`,
        transition: 'background 200ms ease, border-color 200ms ease',
      }}
    >
      <div
        style={{
          padding: '16px 5%',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* Brand */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <svg
            viewBox="0 0 120 100"
            width={36}
            height={30}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ display: 'block', flexShrink: 0 }}
          >
            <path d="M60,52 L28,84 L28,70 L60,38 L92,70 L92,84 Z" fill="#26251e" />
            <path d="M52,32 L60,24 L100,24 L92,32 Z" fill="#26251e" />
          </svg>
          <span
            style={{
              font: '500 19px/1 var(--font-space-grotesk), sans-serif',
              letterSpacing: '-0.4px',
              color: '#26251e',
            }}
          >
            BrickScore
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'inline-flex', gap: 2, marginLeft: 8 }}>
          {['Produkt', 'Preise', 'Saved Deals'].map((label) => (
            <Link key={label} href="#" className="v-navlink">
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Account */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Link href="/login" className="v-navlink">
            Anmelden
          </Link>
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 9999,
              background: '#26251e',
              color: '#f2f1ed',
              font: '500 13.5px/1 var(--font-space-grotesk), sans-serif',
              textDecoration: 'none',
              transition: 'transform 180ms cubic-bezier(0.2,0.9,0.3,1), background 180ms ease, box-shadow 220ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.background = '#0f0e0a'
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(38,37,30,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.background = '#26251e'
              e.currentTarget.style.boxShadow = ''
            }}
          >
            Registrieren
          </Link>
        </div>
      </div>
    </header>
  )
}
