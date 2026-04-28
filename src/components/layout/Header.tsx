'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { BrickScoreLogo } from '@/components/ui/brickscore-logo'
import { MobileNav } from '@/components/mobile-nav'

const NAV_LINKS = [
  ['Dashboard', '/dashboard/new'],
  ['Preise', '/preise'],
  ['About', '/#about'],
] as const

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const handleNavClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('/#') && pathname === '/') {
      e.preventDefault()
      const id = href.slice(2)
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
        className="px-5 md:px-12 flex items-center justify-between"
        style={{ height: 68 }}
      >
        {/* Logo — left */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
          }}
        >
          <BrickScoreLogo height={14} style={{ display: 'block', flexShrink: 0, position: 'relative', top: -1, verticalAlign: 'middle' }} />
          <span
            style={{
              font: '600 18px/1 var(--font-dm-sans), sans-serif',
              color: '#0a0a0a',
              letterSpacing: '-0.4px',
            }}
          >
            brickscore
          </span>
        </Link>

        {/* Center nav — desktop only */}
        <nav className="hidden md:flex items-center" style={{ gap: 36 }}>
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={handleNavClick(href)}
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

        {/* Right actions */}
        <div className="flex items-center" style={{ gap: 12 }}>
          {/* Mobile hamburger menu — first on mobile */}
          <MobileNav />

          {/* Auth area: UserMenu (any width) or CTAs (desktop only) */}
          {status === 'loading' ? (
            <span style={{ width: 36, height: 36 }} aria-hidden="true" />
          ) : status === 'authenticated' && session?.user ? (
            <UserMenu
              name={session.user.name ?? session.user.email ?? 'Konto'}
              email={session.user.email ?? ''}
              image={session.user.image ?? null}
            />
          ) : (
            <div className="hidden md:flex items-center" style={{ gap: 20 }}>
              <Link
                href="/login?callbackUrl=/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 24px',
                  background: '#FFFFFF',
                  color: '#1C1C1C',
                  borderRadius: 10,
                  font: '500 14px/1 var(--font-dm-sans), sans-serif',
                  textDecoration: 'none',
                  border: '1px solid #D6D6D4',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F5F3' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF' }}
              >
                Anmelden
              </Link>
              <Link
                href="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 24px',
                  background: '#1C1C1C',
                  color: '#FFFFFF',
                  borderRadius: 10,
                  font: '500 14px/1 var(--font-dm-sans), sans-serif',
                  textDecoration: 'none',
                  border: 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#2C2C2C' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#1C1C1C' }}
              >
                Kostenlos starten
              </Link>
            </div>
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
            href="/dashboard/settings"
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
