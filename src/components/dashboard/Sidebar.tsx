'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const NAV: { key: string; href: string; label: string; icon: React.ReactNode }[] = [
  {
    key: 'new',
    href: '/dashboard/new',
    label: 'Neuer Deal',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    key: 'dashboard',
    href: '/dashboard',
    label: 'Meine Deals',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    key: 'exports',
    href: '/dashboard/exports',
    label: 'Meine Exporte',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
]

const SETTINGS_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.86l.06.07a2 2 0 1 1-2.84 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.86.34l-.07.06A2 2 0 1 1 4.13 16.9l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.86l-.06-.07A2 2 0 1 1 7.1 4.13l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.07-.06A2 2 0 1 1 19.87 7.1l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
)

export default function Sidebar() {
  const pathname = usePathname() ?? '/dashboard'
  const { data: session } = useSession()
  const user = session?.user
  const displayName = user?.name?.includes('@') ? user.name.split('@')[0] : (user?.name ?? user?.email ?? '')
  const initial = (displayName || user?.email || '?').trim().charAt(0).toUpperCase()

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: '#ffffff',
      borderRight: '1px solid #ececec',
      display: 'flex', flexDirection: 'column',
      padding: '22px 14px 18px',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Brand */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px 18px', textDecoration: 'none' }}>
        <svg viewBox="0 0 120 100" width={20} height={17} aria-hidden="true">
          <path d="M60,52 L28,84 L28,70 L60,38 L92,70 L92,84 Z" fill="#0a0a0a" />
          <path d="M52,32 L60,24 L100,24 L92,32 Z" fill="#0a0a0a" />
        </svg>
        <span style={{ font: '500 18px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', letterSpacing: '-0.4px' }}>brickscore</span>
      </Link>

      {/* Section label */}
      <div style={{ padding: '0 8px 6px', font: '600 10.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#9a9a9a' }}>
        Konto
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((n) => {
          const active = pathname === n.href
          return (
            <Link
              key={n.key}
              href={n.href}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 7,
                background: active ? '#F5F5F3' : 'transparent',
                color: active ? '#0a0a0a' : '#4a4a4a',
                font: `${active ? '600' : '500'} 13.5px/1 var(--font-dm-sans), sans-serif`,
                textDecoration: 'none',
                transition: 'background 130ms ease, color 130ms ease',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#f8f8f6' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ color: active ? '#0a0a0a' : '#7a7a7a' }}>{n.icon}</span>
              {n.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* User block */}
      <div style={{ padding: '12px 8px 4px', borderTop: '1px solid #ececec', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <span style={{
            width: 30, height: 30, flexShrink: 0, borderRadius: '50%',
            background: user?.image ? `url(${user.image}) center/cover no-repeat` : 'linear-gradient(135deg, #3d3d3d, #141414)',
            color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            font: '600 12.5px/1 var(--font-dm-sans), sans-serif',
          }}>
            {!user?.image && initial}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ font: '600 12.5px/1.2 var(--font-dm-sans), sans-serif', color: '#0a0a0a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName || 'Konto'}
            </span>
            {user?.email && (
              <span style={{ font: '400 11px/1.3 var(--font-dm-sans), sans-serif', color: '#9a9a9a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Link
            href="/dashboard/settings"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 8px', borderRadius: 6,
              background: pathname === '/dashboard/settings' ? '#F5F5F3' : 'transparent',
              color: pathname === '/dashboard/settings' ? '#0a0a0a' : '#6a6a6a',
              font: `${pathname === '/dashboard/settings' ? '600' : '500'} 12.5px/1 var(--font-dm-sans), sans-serif`,
              textDecoration: 'none',
              transition: 'background 130ms ease, color 130ms ease',
            }}
            onMouseEnter={(e) => { if (pathname !== '/dashboard/settings') { e.currentTarget.style.background = '#f8f8f6'; e.currentTarget.style.color = '#0a0a0a' } }}
            onMouseLeave={(e) => { if (pathname !== '/dashboard/settings') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6a6a6a' } }}
          >
            <span style={{ color: pathname === '/dashboard/settings' ? '#0a0a0a' : '#9a9a9a' }}>{SETTINGS_ICON}</span>
            Einstellungen
          </Link>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: '/' })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 8px', borderRadius: 6,
              border: 'none', background: 'transparent',
              font: '500 12.5px/1 var(--font-dm-sans), sans-serif', color: '#6a6a6a',
              cursor: 'pointer', textAlign: 'left',
              transition: 'background 130ms ease, color 130ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f8f6'; e.currentTarget.style.color = '#0a0a0a' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6a6a6a' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9a9a9a' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Abmelden
          </button>
        </div>
      </div>
    </aside>
  )
}
