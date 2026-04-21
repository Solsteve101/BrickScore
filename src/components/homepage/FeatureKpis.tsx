'use client'

import SectionEyebrow from './SectionEyebrow'

interface KpiCard {
  label: string
  value: string
  sub: string
  color: string
  star?: boolean
}

const KPIS: KpiCard[] = [
  { label: 'Monats-Cashflow', value: '+€ 412', sub: 'nach Kapitaldienst', color: '#1f8a65' },
  { label: 'Netto-Rendite', value: '4,8 %', sub: 'nach allen Kosten', color: '#26251e' },
  { label: 'Cash-on-Cash', value: '6,2 %', sub: 'auf Eigenkapital', color: '#26251e', star: true },
  { label: 'LTV', value: '78 %', sub: 'Loan-to-Value', color: '#26251e' },
]

export default function FeatureKpis() {
  return (
    <SectionEyebrow
      num="02"
      title="Alle KPIs auf einen Blick"
      subtitle="Cashflow, Mietrendite und Cash-on-Cash Return. Präzise berechnet, fertig für dein Bankgespräch."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginTop: 24,
        }}
      >
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              padding: '22px 22px 20px',
              borderRadius: 12,
              background: '#f7f7f4',
              boxShadow: '0 0 0 1px rgba(38,37,30,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              transition: 'transform 220ms cubic-bezier(0.2,0.9,0.3,1), box-shadow 220ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(38,37,30,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(38,37,30,0.08)'
            }}
          >
            <div
              style={{
                font: '500 10.5px/1 var(--font-space-grotesk), sans-serif',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: 'rgba(38,37,30,0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {kpi.label}
              {kpi.star && <span style={{ color: '#f54e00', fontSize: 12 }}>★</span>}
            </div>
            <div
              style={{
                font: '500 32px/1.05 var(--font-jetbrains-mono), monospace',
                fontVariantNumeric: 'tabular-nums',
                color: kpi.color,
                letterSpacing: '-0.01em',
              }}
            >
              {kpi.value}
            </div>
            <div
              style={{
                font: '400 12.5px/1.3 var(--font-space-grotesk), sans-serif',
                color: 'rgba(38,37,30,0.55)',
              }}
            >
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>
    </SectionEyebrow>
  )
}
