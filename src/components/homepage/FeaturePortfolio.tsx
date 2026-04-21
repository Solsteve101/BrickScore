'use client'

import SectionEyebrow from './SectionEyebrow'

type DealState = 'ok' | 'warn' | 'bad'

interface Deal {
  name: string
  loc: string
  price: string
  rent: string
  yld: string
  cf: string
  state: DealState
}

const DEALS: Deal[] = [
  { name: 'Prenzlauer Berg 3-FH',  loc: 'Berlin',  price: '€ 820.000', rent: '€ 3.420', yld: '4,8 %', cf: '+€ 412', state: 'ok' },
  { name: 'Glockenbachviertel ETW', loc: 'München', price: '€ 489.000', rent: '€ 1.580', yld: '3,2 %', cf: '–€ 85',  state: 'bad' },
  { name: 'St. Pauli DHH',          loc: 'Hamburg', price: '€ 1.1M',    rent: '€ 4.200', yld: '5,4 %', cf: '+€ 780', state: 'ok' },
  { name: 'Innenstadt 2-FH',        loc: 'Leipzig', price: '€ 340.000', rent: '€ 1.620', yld: '5,9 %', cf: '+€ 290', state: 'ok' },
  { name: 'Gärtnerplatz ETW',       loc: 'München', price: '€ 620.000', rent: '€ 2.100', yld: '4,1 %', cf: '+€ 95',  state: 'warn' },
]

const STATE_COLOR: Record<DealState, string> = {
  ok:   '#1f8a65',
  warn: '#c08532',
  bad:  '#cf2d56',
}
const STATE_LABEL: Record<DealState, string> = {
  ok:   'Stark',
  warn: 'Grenzwertig',
  bad:  'Schwach',
}

export default function FeaturePortfolio() {
  return (
    <SectionEyebrow
      num="03"
      title="Deals vergleichen und filtern"
      subtitle="Speichere Objekte und sortiere nach Rendite, Cashflow oder Kaufpreis. Dein Portfolio immer im Überblick."
    >
      <div
        style={{
          marginTop: 24,
          padding: 24,
          borderRadius: 14,
          background: '#f7f7f4',
          boxShadow: '0 0 0 1px rgba(38,37,30,0.08)',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
            gap: 0,
            padding: '0 4px 12px',
            borderBottom: '1px solid rgba(38,37,30,0.08)',
            font: '500 10.5px/1 var(--font-space-grotesk), sans-serif',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: 'rgba(38,37,30,0.45)',
          }}
        >
          <span>Objekt</span>
          <span>Preis</span>
          <span>Miete / M</span>
          <span>Rendite</span>
          <span>Cashflow</span>
          <span>Status</span>
        </div>

        {/* Data rows */}
        {DEALS.map((deal, i) => {
          const stateColor = STATE_COLOR[deal.state]
          const stateLabel = STATE_LABEL[deal.state]
          const cfColor = deal.cf.startsWith('–') ? '#cf2d56' : '#1f8a65'
          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                gap: 0,
                alignItems: 'center',
                padding: '14px 4px',
                borderBottom: i < DEALS.length - 1 ? '1px solid rgba(38,37,30,0.04)' : 'none',
                font: '500 14px var(--font-space-grotesk), sans-serif',
                color: '#26251e',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(38,37,30,0.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <div>
                <div>{deal.name}</div>
                <div
                  style={{
                    font: '400 11.5px/1 var(--font-space-grotesk), sans-serif',
                    color: 'rgba(38,37,30,0.5)',
                    marginTop: 4,
                  }}
                >
                  {deal.loc}
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>{deal.price}</span>
              <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>{deal.rent}</span>
              <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>{deal.yld}</span>
              <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: cfColor }}>{deal.cf}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 9px 3px 8px',
                  borderRadius: 9999,
                  background: stateColor + '15',
                  font: '500 11.5px/1 var(--font-space-grotesk), sans-serif',
                  color: stateColor,
                  width: 'fit-content',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 9999, background: stateColor, display: 'inline-block' }} />
                {stateLabel}
              </span>
            </div>
          )
        })}
      </div>
    </SectionEyebrow>
  )
}
