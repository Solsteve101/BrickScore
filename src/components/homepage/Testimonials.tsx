const TESTIMONIALS = [
  {
    quote: 'Mit BrickScore sehe ich in 30 Sekunden, ob ein Deal sich rechnet. Excel brauch ich dafür nicht mehr.',
    name: 'Markus R.',
    role: 'Privatinvestor',
    location: 'München',
    portfolio: '4 Einheiten',
    initials: 'MR',
  },
  {
    quote: 'Endlich ein Tool, das Kaufnebenkosten nach Bundesland automatisch berechnet. Das hat mir früher immer gefehlt.',
    name: 'Sandra K.',
    role: 'Immobilienkäuferin',
    location: 'Hamburg',
    portfolio: '2 Einheiten',
    initials: 'SK',
  },
  {
    quote: 'Der Deal Score hilft mir, Objekte objektiv zu vergleichen. Kein Bauchgefühl mehr, nur Zahlen.',
    name: 'Thomas W.',
    role: 'Buy & Hold Investor',
    location: 'Berlin',
    portfolio: '8 Einheiten',
    initials: 'TW',
  },
  {
    quote: 'Ich nutze BrickScore für jede Besichtigung als Vorbereitung. Die Cashflow-Analyse ist unschlagbar einfach.',
    name: 'Julia M.',
    role: 'Immobilienanalystin',
    location: 'Frankfurt',
    portfolio: '6 Einheiten',
    initials: 'JM',
  },
]

export default function Testimonials() {
  return (
    <section style={{ padding: '96px 5%', background: '#fff', borderTop: '1px solid #e5e5e5' }}>
      <h2
        style={{
          margin: '0 0 10px',
          font: '700 clamp(28px, 3vw, 40px)/1.1 var(--font-dm-sans), sans-serif',
          letterSpacing: '-0.025em',
          color: '#0a0a0a',
        }}
      >
        Vertrauen von Investoren
      </h2>
      <p
        style={{
          margin: '0 0 56px',
          font: '400 15px/1 var(--font-dm-sans), sans-serif',
          color: '#8a8a8a',
        }}
      >
        Von privaten Käufern bis zu erfahrenen Portfolio-Investoren.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
        }}
      >
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            style={{
              border: '1px solid #e5e5e5',
              borderRadius: 12,
              padding: '24px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: '600 14px/1 var(--font-dm-sans)',
                  color: '#4a4a4a',
                  flexShrink: 0,
                }}
              >
                {t.initials}
              </div>
              <div>
                <div style={{ font: '600 14px/1 var(--font-dm-sans)', color: '#0a0a0a', marginBottom: 4 }}>
                  {t.name}
                </div>
                <div style={{ font: '400 12px/1 var(--font-dm-sans)', color: '#8a8a8a' }}>
                  {t.role} · {t.location}
                </div>
              </div>
            </div>

            {/* Quote */}
            <p
              style={{
                margin: 0,
                font: '400 13.5px/1.55 var(--font-dm-sans), sans-serif',
                color: '#4a4a4a',
                flex: 1,
              }}
            >
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Portfolio badge */}
            <div
              style={{
                font: '500 11.5px/1 var(--font-dm-sans)',
                color: '#8a8a8a',
                borderTop: '1px solid #f0f0f0',
                paddingTop: 14,
              }}
            >
              Portfolio: {t.portfolio}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
