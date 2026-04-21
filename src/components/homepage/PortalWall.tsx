'use client'

const PORTALS = ['ImmoScout24', 'Immowelt', 'Kleinanzeigen', 'Engel & Völkers', 'Immonet', 'eBay Kleinanzeigen']

export default function PortalWall() {
  return (
    <section
      style={{
        padding: '72px 5% 16px',
      }}
    >
      <p
        style={{
          margin: '0 0 24px',
          textAlign: 'center',
          font: '500 11px/1 var(--font-space-grotesk), sans-serif',
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          color: 'rgba(38,37,30,0.45)',
        }}
      >
        Inserate direkt von führenden Immobilien-Portalen importieren
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 0,
          borderTop: '1px solid rgba(38,37,30,0.08)',
          borderBottom: '1px solid rgba(38,37,30,0.08)',
        }}
      >
        {PORTALS.map((portal, i) => (
          <div
            key={portal}
            style={{
              padding: '26px 16px',
              textAlign: 'center',
              font: '500 15px/1 var(--font-space-grotesk), sans-serif',
              color: 'rgba(38,37,30,0.55)',
              letterSpacing: '-0.2px',
              borderRight: i < PORTALS.length - 1 ? '1px solid rgba(38,37,30,0.06)' : 'none',
              transition: 'color 200ms ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#26251e'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(38,37,30,0.55)'
            }}
          >
            {portal}
          </div>
        ))}
      </div>
    </section>
  )
}
