'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

const NAV_LINKS = [
  ['Meine Deals', '/dashboard'],
  ['Preise', '#'],
  ['Ressourcen', '#'],
] as const

export default function Header() {
  const { data: session, status } = useSession()
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
          {status === 'loading' ? (
            <span style={{ width: 36, height: 36 }} aria-hidden="true" />
          ) : status === 'authenticated' && session?.user ? (
            <UserMenu
              name={session.user.name ?? session.user.email ?? 'Konto'}
              email={session.user.email ?? ''}
              image={session.user.image ?? null}
            />
          ) : (
            <>
              <Link
                href="/login?callbackUrl=/dashboard"
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
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function UserMenu({ name, email, image }: { name: string; email: string; image: string | null }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const initial = (name || email || '?').trim().charAt(0).toUpperCase()
  const displayName = name.includes('@') ? name.split('@')[0] : name

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-label={`Konto-Menü für ${displayName}`}
        style={{
          width: 36, height: 36, padding: 0, borderRadius: '50%',
          border: '1px solid #e5e5e5', background: 'transparent',
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 140ms ease, box-shadow 140ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#bbbbbb'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.boxShadow = 'none' }}
      >
        <span style={{
          width: 30, height: 30, borderRadius: '50%',
          background: image ? `url(${image}) center/cover no-repeat` : 'linear-gradient(135deg, #3d3d3d, #141414)',
          color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          font: '600 12.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0,
        }}>
          {!image && initial}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            minWidth: 220, padding: 6,
            background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: 10,
            boxShadow: '0 10px 28px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)',
            zIndex: 50,
          }}
        >
          <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid #f0f0f0', marginBottom: 4 }}>
            <div style={{ font: '500 13px/1.2 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>{displayName}</div>
            {email && <div style={{ marginTop: 2, font: '400 12px/1.3 var(--font-dm-sans), sans-serif', color: '#9a9a9a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>}
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            style={{ display: 'block', padding: '9px 12px', borderRadius: 6, font: '500 13px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            Meine Deals
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            style={{ display: 'block', padding: '9px 12px', borderRadius: 6, font: '500 13px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            Einstellungen
          </Link>
          <button
            type="button"
            onClick={() => { setOpen(false); void signOut({ callbackUrl: '/' }) }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '9px 12px', marginTop: 2, borderRadius: 6,
              border: 'none', background: 'transparent', cursor: 'pointer',
              font: '500 13px/1 var(--font-dm-sans), sans-serif', color: '#cf2d56',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(207,45,86,0.06)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            Abmelden
          </button>
        </div>
      )}
    </div>
  )
}
