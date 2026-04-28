'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { getUsage, type UsagePlan } from '@/lib/usage-store'
import { BrickScoreLogo } from '@/components/ui/brickscore-logo'

interface NavItem {
  key: string
  href: string
  label: string
  icon: React.ReactNode
}

const PLUS_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const DASHBOARD_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
)
const DOWNLOAD_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const USAGE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="20" x2="3" y2="10" />
    <line x1="9" y1="20" x2="9" y2="6" />
    <line x1="15" y1="20" x2="15" y2="13" />
    <line x1="21" y1="20" x2="21" y2="4" />
  </svg>
)
const CARD_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
)
const SETTINGS_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.86l.06.07a2 2 0 1 1-2.84 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.86.34l-.07.06A2 2 0 1 1 4.13 16.9l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.86l-.06-.07A2 2 0 1 1 7.1 4.13l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.07-.06A2 2 0 1 1 19.87 7.1l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
)

const GROUP_KONTO: NavItem[] = [
  { key: 'new', href: '/dashboard/new', label: 'Neuer Deal', icon: PLUS_ICON },
  { key: 'dashboard', href: '/dashboard', label: 'Meine Deals', icon: DASHBOARD_ICON },
  { key: 'exports', href: '/dashboard/exports', label: 'Meine Exporte', icon: DOWNLOAD_ICON },
]
const GROUP_NUTZUNG: NavItem[] = [
  { key: 'usage', href: '/dashboard/usage', label: 'Nutzung', icon: USAGE_ICON },
  { key: 'subscription', href: '/dashboard/subscription', label: 'Abonnement', icon: CARD_ICON },
]
const GROUP_SETTINGS: NavItem[] = [
  { key: 'settings', href: '/dashboard/settings', label: 'Einstellungen', icon: SETTINGS_ICON },
]

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 6,
        background: active ? '#EEEDEB' : 'transparent',
        color: active ? '#0a0a0a' : '#4a4a4a',
        font: `500 13.5px/1 var(--font-dm-sans), sans-serif`,
        textDecoration: 'none',
        transition: 'background 130ms ease, color 130ms ease',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#F2F1EE' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ color: active ? '#0a0a0a' : '#7a7a7a' }}>{item.icon}</span>
      {item.label}
    </Link>
  )
}

function Divider() {
  return <span style={{ height: 1, background: '#E7E5E1', display: 'block', margin: '10px 4px' }} />
}

export default function Sidebar() {
  const pathname = usePathname() ?? '/dashboard'
  const { data: session } = useSession()
  const user = session?.user
  const displayName = user?.name?.includes('@') ? user.name.split('@')[0] : (user?.name ?? user?.email ?? '')
  const initial = (displayName || user?.email || '?').trim().charAt(0).toUpperCase()

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: '#F9F8F6',
      borderRight: '1px solid #E7E5E1',
      display: 'flex', flexDirection: 'column',
      padding: '22px 14px 18px',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Brand */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px 18px', textDecoration: 'none' }}>
        <BrickScoreLogo height={13} style={{ display: 'block', flexShrink: 0, position: 'relative', top: -1, verticalAlign: 'middle' }} />
        <span style={{ font: '600 17px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', letterSpacing: '-0.4px' }}>brickscore</span>
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {GROUP_KONTO.map((n) => (
          <NavRow key={n.key} item={n} active={pathname === n.href} />
        ))}
        <Divider />
        {GROUP_NUTZUNG.map((n) => (
          <NavRow key={n.key} item={n} active={pathname === n.href} />
        ))}
        <Divider />
        {GROUP_SETTINGS.map((n) => (
          <NavRow key={n.key} item={n} active={pathname === n.href} />
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <UserBlock
        displayName={displayName}
        email={user?.email ?? ''}
        image={user?.image ?? null}
        initial={initial}
      />
    </aside>
  )
}

function UserBlock({ displayName, email, image, initial }: { displayName: string; email: string; image: string | null; initial: string }) {
  const [hover, setHover] = useState(false)
  const [plan, setPlan] = useState<UsagePlan>('free')

  useEffect(() => {
    const sync = () => setPlan(getUsage().plan)
    sync()
    const onFocus = () => sync()
    const onStorage = (e: StorageEvent) => { if (e.key === 'brickscore_usage') sync() }
    window.addEventListener('focus', onFocus)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return (
    <div style={{ borderTop: '1px solid #E7E5E1', marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 8px' }}>
        <span style={{
          width: 30, height: 30, flexShrink: 0, borderRadius: '50%',
          background: image ? `url(${image}) center/cover no-repeat` : 'linear-gradient(135deg, #3d3d3d, #141414)',
          color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          font: '600 12.5px/1 var(--font-dm-sans), sans-serif',
        }}>
          {!image && initial}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, gap: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{ font: '600 12.5px/1.2 var(--font-dm-sans), sans-serif', color: '#0a0a0a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName || 'Konto'}
            </span>
            <PlanBadge plan={plan} />
          </div>
          {email && (
            <span style={{ font: '400 11px/1.3 var(--font-dm-sans), sans-serif', color: '#9a9a9a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => void signOut({ callbackUrl: '/' })}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          alignSelf: 'flex-start',
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '2px 8px',
          font: '400 12px/1.2 var(--font-dm-sans), sans-serif',
          color: hover ? '#ef4444' : '#9a9a9a',
          transition: 'color 140ms ease',
        }}
      >
        Abmelden
      </button>
    </div>
  )
}

function PlanBadge({ plan }: { plan: UsagePlan }) {
  const styles: Record<UsagePlan, { bg: string; fg: string; border?: string; label: string }> = {
    free:     { bg: '#f1f0ec', fg: '#5a5a5a', border: '#e7e5e1', label: 'Free' },
    pro:      { bg: 'rgba(184,150,12,0.10)', fg: '#8a6f0a', border: 'rgba(184,150,12,0.25)', label: 'Pro' },
    business: { bg: '#0a0a0a', fg: '#ffffff', label: 'Business' },
  }
  const s = styles[plan]
  return (
    <span style={{
      flexShrink: 0,
      padding: '2px 8px',
      borderRadius: 9999,
      background: s.bg,
      color: s.fg,
      border: s.border ? `1px solid ${s.border}` : 'none',
      font: '600 9.5px/1 var(--font-dm-sans), sans-serif',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    }}>
      {s.label}
    </span>
  )
}
