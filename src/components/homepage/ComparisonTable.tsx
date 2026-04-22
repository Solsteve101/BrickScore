const ROWS = [
  { feature: 'URL-Import aus Immoportalen', bs: true, excel: false, makler: false },
  { feature: 'Kaufnebenkosten nach Bundesland', bs: true, excel: false, makler: true },
  { feature: 'Automatischer Cashflow', bs: true, excel: false, makler: false },
  { feature: 'Mietrendite & Cash-on-Cash', bs: true, excel: true, makler: false },
  { feature: 'Deal Score (0–100)', bs: true, excel: false, makler: false },
  { feature: 'Portfolio-Vergleich', bs: true, excel: true, makler: false },
  { feature: 'Kaufnebenkosten-Rechner', bs: true, excel: false, makler: true },
  { feature: 'Keine Installation nötig', bs: true, excel: false, makler: true },
  { feature: 'Kostenlos nutzbar', bs: true, excel: true, makler: false },
]

function Check({ yes }: { yes: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: yes ? '#0a0a0a' : 'transparent',
        border: yes ? 'none' : '1px solid #d0d0d0',
      }}
    >
      {yes ? (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path d="M1 4.5L4 7.5L10 1.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 1L7 7M7 1L1 7" stroke="#cccccc" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      )}
    </span>
  )
}

export default function ComparisonTable() {
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
        Der BrickScore Unterschied
      </h2>
      <p
        style={{
          margin: '0 0 48px',
          font: '400 15px/1 var(--font-dm-sans), sans-serif',
          color: '#8a8a8a',
        }}
      >
        Was BrickScore bietet, was Excel und Makler nicht können.
      </p>

      <div
        style={{
          border: '1px solid #e5e5e5',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px 140px 140px',
            padding: '0 24px',
            background: '#f8f8f8',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <div style={{ padding: '14px 0', font: '500 12px/1 var(--font-dm-sans)', color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Feature
          </div>
          {[
            { label: 'BrickScore', highlight: true },
            { label: 'Excel', highlight: false },
            { label: 'Makler', highlight: false },
          ].map((col) => (
            <div
              key={col.label}
              style={{
                padding: '14px 0',
                textAlign: 'center',
                font: `${col.highlight ? '600' : '500'} 13px/1 var(--font-dm-sans)`,
                color: col.highlight ? '#0a0a0a' : '#8a8a8a',
              }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {ROWS.map((row, i) => (
          <div
            key={row.feature}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px 140px 140px',
              padding: '0 24px',
              borderBottom: i < ROWS.length - 1 ? '1px solid #f0f0f0' : 'none',
              background: '#fff',
            }}
          >
            <div
              style={{
                padding: '16px 0',
                font: '400 14px/1.4 var(--font-dm-sans)',
                color: '#3a3a3a',
              }}
            >
              {row.feature}
            </div>
            {[row.bs, row.excel, row.makler].map((val, j) => (
              <div
                key={j}
                style={{ padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Check yes={val} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
