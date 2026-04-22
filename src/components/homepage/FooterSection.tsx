'use client'

interface FooterCol {
  title: string
  links: string[]
}

const FOOTER_COLS: FooterCol[] = [
  {
    title: 'Produkt',
    links: ['Rendite Rechner', 'URL-Import', 'Deal Dashboard', 'Preise'],
  },
  {
    title: 'Firma',
    links: ['Über uns', 'Kontakt', 'Karriere', 'Presse'],
  },
  {
    title: 'Ressourcen',
    links: ['Investoren-Blog', 'Kaufnebenkosten Guide', 'Nebenkosten-Tabelle', 'API'],
  },
  {
    title: 'Rechtliches',
    links: ['Impressum', 'Datenschutz', 'AGB', 'Cookies'],
  },
]

export default function FooterSection() {
  return (
    <footer
      style={{
        background: '#0f0f0f',
        color: '#f0f0f0',
        padding: '64px 5% 40px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: 48,
          paddingBottom: 56,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Brand column */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
            <svg viewBox="0 0 120 100" width={20} height={16} aria-hidden="true" style={{ display: 'block' }}>
              <path d="M60,52 L28,84 L28,70 L60,38 L92,70 L92,84 Z" fill="rgba(255,255,255,0.7)" />
              <path d="M52,32 L60,24 L100,24 L92,32 Z" fill="rgba(255,255,255,0.7)" />
            </svg>
            <span
              style={{
                font: '600 14px/1 var(--font-dm-sans), sans-serif',
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: '-0.2px',
              }}
            >
              brickscore
            </span>
          </div>
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
                <li key={link}>
                  <a
                    href="#"
                    style={{
                      font: '400 13px/1 var(--font-dm-sans), sans-serif',
                      color: 'rgba(255,255,255,0.5)',
                      textDecoration: 'none',
                      transition: 'color 130ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
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
        <span>© 2026 BrickScore · Made in Berlin</span>
        <span>Alle Berechnungen sind Richtwerte und keine Anlageberatung.</span>
      </div>
    </footer>
  )
}
