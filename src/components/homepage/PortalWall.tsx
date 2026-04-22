const PORTALS = [
  'ImmoScout24',
  'Immowelt',
  'Kleinanzeigen',
  'Engel & Völkers',
  'Immonet',
  'Wohnungsboerse',
  'immobilien.de',
]

export default function PortalWall() {
  return (
    <section
      style={{
        padding: '0 5% 0',
        borderTop: '1px solid #e5e5e5',
        borderBottom: '1px solid #e5e5e5',
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          height: 64,
        }}
      >
        <span
          style={{
            font: '400 12px/1 var(--font-dm-sans), sans-serif',
            color: '#aaaaaa',
            whiteSpace: 'nowrap',
            marginRight: 36,
            letterSpacing: '0.01em',
          }}
        >
          kompatibel mit
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 36,
            overflow: 'hidden',
          }}
        >
          {PORTALS.map((name) => (
            <span
              key={name}
              style={{
                font: '500 13px/1 var(--font-dm-sans), sans-serif',
                color: '#bbbbbb',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
