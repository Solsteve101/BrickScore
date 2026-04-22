type CellValue = 'yes' | 'no' | 'partial'

const ROWS: { feature: string; bs: CellValue; excel: CellValue; other: CellValue }[] = [
  { feature: 'URL-Import aus Immoportalen',                  bs: 'yes', excel: 'no',      other: 'no'      },
  { feature: 'Automatische Kaufnebenkosten nach Bundesland', bs: 'yes', excel: 'no',      other: 'partial' },
  { feature: 'Deal-Score (0–100)',                           bs: 'yes', excel: 'no',      other: 'no'      },
  { feature: '5 KPIs sofort berechnet',                     bs: 'yes', excel: 'partial', other: 'partial' },
  { feature: 'Cashflow-Projektion (10+ Jahre)',              bs: 'yes', excel: 'partial', other: 'yes'     },
  { feature: 'Kostenlos nutzbar',                           bs: 'yes', excel: 'partial', other: 'no'      },
  { feature: 'Keine Installation / kein Setup',             bs: 'yes', excel: 'no',      other: 'partial' },
  { feature: 'Für den deutschen Markt gebaut',              bs: 'yes', excel: 'no',      other: 'partial' },
]

const COLS = [
  { key: 'bs',    label: 'BrickScore',        highlight: true  },
  { key: 'excel', label: 'Excel / Sheets',    highlight: false },
  { key: 'other', label: 'Andere Immo-Tools', highlight: false },
] as const

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === 'yes') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', background: '#1C1C1C' }}>
        <svg width="13" height="10" viewBox="0 0 11 9" fill="none">
          <path d="M1 4.5L4 7.5L10 1.5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (value === 'no') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #e8e8e8' }}>
        <svg width="9" height="9" viewBox="0 0 8 8" fill="none">
          <path d="M1 1L7 7M7 1L1 7" stroke="#d8d8d8" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', background: '#f4f4f4' }}>
      <svg width="10" height="4" viewBox="0 0 10 4" fill="none">
        <path d="M1 2h8" stroke="#b8b8b8" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export default function ComparisonTable() {
  return (
    <section style={{ padding: '96px 5% 48px', background: '#fff' }}>
      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <h2 style={{ margin: '0 0 4px', font: '700 clamp(36px, 4.5vw, 56px)/1.08 var(--font-dm-sans), sans-serif', letterSpacing: '-0.03em', color: '#0a0a0a' }}>
          Der BrickScore
        </h2>
        <h2 style={{ margin: '0 0 20px', font: '400 clamp(36px, 4.5vw, 56px)/1.08 var(--font-dm-sans), sans-serif', letterSpacing: '-0.03em', color: '#c0c0c0' }}>
          Unterschied
        </h2>
        <p style={{ margin: 0, font: '400 17px/1.5 var(--font-dm-sans), sans-serif', color: '#8a8a8a' }}>
          Alles, was du brauchst — ohne die Komplexität teurer Profi-Tools.
        </p>
      </div>

      {/* Table */}
      <div style={{ maxWidth: 1000, margin: '0 auto', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 20px 56px rgba(0,0,0,0.09)' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 180px 190px', background: '#fafafa', borderBottom: '1px solid #efefef' }}>
          <div style={{ padding: '20px 28px', font: '500 11px/1 var(--font-dm-sans)', color: '#aaaaaa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Feature
          </div>
          {COLS.map((col) => (
            <div
              key={col.key}
              style={{
                padding: '20px 0',
                textAlign: 'center',
                font: `${col.highlight ? '700' : '500'} ${col.highlight ? '16px' : '13px'}/1 var(--font-dm-sans)`,
                color: col.highlight ? '#0a0a0a' : '#aaaaaa',
                background: col.highlight ? 'rgba(184,146,26,0.07)' : 'transparent',
              }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {ROWS.map((row, i) => (
          <div
            key={row.feature}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 160px 180px 190px',
              borderBottom: i < ROWS.length - 1 ? '1px solid #f5f5f5' : 'none',
              background: '#ffffff',
            }}
          >
            <div style={{ padding: '22px 28px', font: '400 15px/1.4 var(--font-dm-sans)', color: '#3a3a3a' }}>
              {row.feature}
            </div>
            {COLS.map((col) => (
              <div
                key={col.key}
                style={{
                  padding: '22px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: col.highlight ? 'rgba(184,146,26,0.05)' : 'transparent',
                }}
              >
                <Cell value={row[col.key]} highlight={col.highlight} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 36, marginTop: 36 }}>
        {[
          { icon: <span style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',width:18,height:18,borderRadius:'50%',background:'#1C1C1C' }}><svg width="8" height="7" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>, label: 'Ja' },
          { icon: <span style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',width:18,height:18,borderRadius:'50%',border:'1.5px solid #e0e0e0' }}><svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 1L7 7M7 1L1 7" stroke="#d8d8d8" strokeWidth="1.4" strokeLinecap="round" /></svg></span>, label: 'Nein' },
          { icon: <span style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',width:18,height:18,borderRadius:'50%',background:'#f4f4f4' }}><svg width="9" height="3" viewBox="0 0 10 4" fill="none"><path d="M1 2h8" stroke="#b8b8b8" strokeWidth="1.6" strokeLinecap="round" /></svg></span>, label: 'Teilweise / manuell' },
        ].map(({ icon, label }) => (
          <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, font: '400 14px/1 var(--font-dm-sans)', color: '#9a9a9a' }}>
            {icon}{label}
          </span>
        ))}
      </div>
    </section>
  )
}
