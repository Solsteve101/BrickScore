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
        borderTop: '1px solid rgba(38,37,30,0.08)',
        padding: '64px 5% 40px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: 48,
        }}
      >
        {/* Brand column */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <svg
              viewBox="0 0 120 100"
              width={32}
              height={26}
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ display: 'block', flexShrink: 0 }}
            >
              <path d="M60,52 L28,84 L28,70 L60,38 L92,70 L92,84 Z" fill="#26251e" />
              <path d="M52,32 L60,24 L100,24 L92,32 Z" fill="#26251e" />
            </svg>
            <span
              style={{
                font: '500 18px/1 var(--font-space-grotesk), sans-serif',
                letterSpacing: '-0.4px',
                color: '#26251e',
              }}
            >
              BrickScore
            </span>
          </div>
          <p
            style={{
              margin: 0,
              maxWidth: 280,
              font: '400 13.5px/1.55 var(--font-space-grotesk), sans-serif',
              color: 'rgba(38,37,30,0.55)',
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
                font: '500 11px/1 var(--font-space-grotesk), sans-serif',
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: 'rgba(38,37,30,0.45)',
                marginBottom: 16,
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
                gap: 10,
              }}
            >
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    style={{
                      font: '400 13.5px/1 var(--font-space-grotesk), sans-serif',
                      color: 'rgba(38,37,30,0.7)',
                      textDecoration: 'none',
                      transition: 'color 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#cf2d56'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(38,37,30,0.7)'
                    }}
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
          marginTop: 64,
          paddingTop: 24,
          borderTop: '1px solid rgba(38,37,30,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          font: '400 12px/1 var(--font-space-grotesk), sans-serif',
          color: 'rgba(38,37,30,0.45)',
        }}
      >
        <span>© 2026 BrickScore · Made in Berlin</span>
        <span>Alle Berechnungen sind Richtwerte und keine Anlageberatung.</span>
      </div>
    </footer>
  )
}
