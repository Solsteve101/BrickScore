const STATS = [
  { value: '0 €', label: 'Komplett kostenlos' },
  { value: '30 Sek.', label: 'Bis zur Analyse' },
  { value: '5 KPIs + Score', label: 'Automatisch berechnet' },
  { value: 'Kein Excel', label: 'Alles im Browser' },
]

export default function StatsBar() {
  return (
    <section id="demo" className="bs-stats-section" style={{ padding: '72px 5%', background: '#fff', scrollMarginTop: 80 }}>
      <div className="bs-stats-grid">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`bs-stat-cell bs-stat-${i}`}
            style={{ padding: '0 32px' }}
          >
            <div
              style={{
                font: '700 clamp(28px, 3.5vw, 48px)/1 var(--font-dm-sans), sans-serif',
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
      <style>{`
        .bs-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .bs-stat-cell { border-left: 1px solid #e5e5e5; }
        .bs-stat-0 { border-left: none; }
        @media (max-width: 768px) {
          .bs-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 32px 0;
          }
          .bs-stat-cell { padding: 0 16px !important; }
          .bs-stat-0, .bs-stat-2 { border-left: none; }
          .bs-stat-1, .bs-stat-3 { border-left: 1px solid #e5e5e5; }
        }
      `}</style>
    </section>
  )
}
