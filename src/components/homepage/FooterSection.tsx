'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrickScoreLogo } from '@/components/ui/brickscore-logo'

interface FooterLink {
  label: string
  href: string
}

interface FooterCol {
  title: string
  links: FooterLink[]
}

const FOOTER_COLS: FooterCol[] = [
  {
    title: 'Produkt',
    links: [
      { label: 'Dashboard', href: '/dashboard/new' },
      { label: 'Meine Deals', href: '/dashboard' },
      { label: 'Export', href: '/dashboard/exports' },
      { label: 'Preise', href: '/preise' },
    ],
  },
  {
    title: 'Firma',
    links: [
      { label: 'Über uns', href: '/#about' },
      { label: 'Kontakt', href: '/kontakt' },
    ],
  },
  {
    title: 'Rechtliches',
    links: [
      { label: 'Impressum', href: '/impressum' },
      { label: 'Datenschutz', href: '/datenschutz' },
      { label: 'AGB', href: '/agb' },
    ],
  },
]

export default function FooterSection() {
  const pathname = usePathname()

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer
      style={{
        background: '#0f0f0f',
        color: '#f0f0f0',
        padding: '64px 5% 40px',
      }}
    >
      <div
        className="bs-footer-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 48,
          paddingBottom: 56,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Brand column */}
        <div>
          <Link
            href="/"
            onClick={handleBrandClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              textDecoration: 'none',
            }}
          >
            <BrickScoreLogo height={13} color="#FFFFFF" style={{ display: 'block', flexShrink: 0, opacity: 0.85, position: 'relative', top: -1, verticalAlign: 'middle' }} />
            <span
              style={{
                font: '600 14px/1 var(--font-dm-sans), sans-serif',
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: '-0.2px',
              }}
            >
              brickscore
            </span>
          </Link>
          <p
            style={{
              margin: 0,
              maxWidth: 260,
              font: '400 13px/1.6 var(--font-dm-sans), sans-serif',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            Vom Inserat zur Rendite in unter einer Minute. Für Investoren, die mit Zahlen kaufen.
          </p>
        </div>

        {/* Link columns */}
        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <div
              style={{
                font: '500 10.5px/1 var(--font-dm-sans), sans-serif',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: 18,
              }}
            >
              {col.title}
            </div>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      font: '400 13px/1 var(--font-dm-sans), sans-serif',
                      color: 'rgba(255,255,255,0.5)',
                      textDecoration: 'none',
                      transition: 'color 130ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="bs-footer-bottom"
        style={{
          marginTop: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          font: '400 11.5px/1 var(--font-dm-sans), sans-serif',
          color: 'rgba(255,255,255,0.25)',
        }}
      >
        <span>© 2026 brickscore · Made in Germany</span>
        <span>Alle Berechnungen sind Richtwerte und keine Anlageberatung.</span>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .bs-footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            padding-bottom: 40px !important;
          }
          .bs-footer-bottom {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
            line-height: 1.5 !important;
          }
        }
      `}</style>
    </footer>
  )
}
