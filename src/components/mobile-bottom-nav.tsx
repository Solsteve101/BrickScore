'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, LayoutGrid, Download, Settings } from 'lucide-react'

const ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/dashboard/new', icon: Plus, label: 'Neu' },
  { href: '/dashboard', icon: LayoutGrid, label: 'Deals' },
  { href: '/dashboard/exports', icon: Download, label: 'Exporte' },
  { href: '/dashboard/settings', icon: Settings, label: 'Mehr' },
] as const

export function MobileBottomNav() {
  const pathname = usePathname() ?? ''

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      className="bs-bottom-nav md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#ffffff',
        borderTop: '1px solid #E6E6E4',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 56 }}>
        {ITEMS.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '4px 12px',
                color: active ? '#1C1C1C' : '#9CA3AF',
                textDecoration: 'none',
                transition: 'color 130ms ease',
              }}
            >
              <Icon size={20} />
              <span style={{ font: '500 10px/1 var(--font-dm-sans), sans-serif' }}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
