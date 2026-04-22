const STATS = [
  { value: '0 €', label: 'Komplett kostenlos' },
  { value: '30 Sek.', label: 'Bis zur Analyse' },
  { value: '5 KPIs + Score', label: 'Automatisch berechnet' },
  { value: 'Kein Excel', label: 'Alles im Browser' },
]

export default function StatsBar() {
  return (
    <section style={{ padding: '72px 5%', background: '#fff' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
        }}
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              padding: '0 32px',
              borderLeft: i > 0 ? '1px solid #e5e5e5' : 'none',
            }}
          >
            <div
              style={{
                font: '700 clamp(32px, 3.5vw, 48px)/1 var(--font-dm-sans), sans-serif',
                letterSpacing: '-0.03em',
                color: '#0a0a0a',
                marginBottom: 8,
                whiteSpace: 'nowrap',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                font: '400 13.5px/1.3 var(--font-dm-sans), sans-serif',
                color: '#8a8a8a',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
