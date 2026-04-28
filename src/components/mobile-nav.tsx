'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS: Array<[string, string]> = [
  ['Dashboard', '/dashboard/new'],
  ['Preise', '/preise'],
  ['About', '/#about'],
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  const handleLinkClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false)
    if (href.startsWith('/#') && pathname === '/') {
      e.preventDefault()
      const id = href.slice(2)
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div ref={ref} className="md:hidden relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
        aria-expanded={open}
        className="inline-flex items-center justify-center p-0 bg-transparent border-0 outline-none cursor-pointer"
      >
        {open ? <X size={22} color="#1C1C1C" /> : <Menu size={22} color="#1C1C1C" />}
      </button>
      {open && (
        <div
          className="absolute right-0 z-50"
          style={{
            top: 'calc(100% + 8px)',
            width: 220,
            background: '#ffffff',
            borderRadius: 10,
            border: '1px solid #E6E6E4',
            boxShadow: '0 10px 28px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {NAV_ITEMS.map(([label, href], i) => (
            <Link
              key={label}
              href={href}
              onClick={handleLinkClick(href)}
              style={{
                display: 'block',
                padding: '12px 20px',
                font: '500 15px/1.4 var(--font-dm-sans), sans-serif',
                color: '#1C1C1C',
                textDecoration: 'none',
                borderTop: i === 0 ? 'none' : '1px solid #F5F5F3',
                transition: 'background 130ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F5F3' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
