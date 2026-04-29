import SectionEyebrow from './SectionEyebrow'

const EXTRACTED_FIELDS: [string, string][] = [
  ['Kaufpreis', '€ 489.000'],
  ['Wohnfläche', '94 m²'],
  ['Zimmer', '3,5'],
  ['Standort', 'München · Bayern'],
  ['Kaufnebenkosten', '10,5 % (Bayern)'],
]

const BULLET_POINTS: [string, string][] = [
  [
    'Daten direkt aus dem Inserat',
    'Kaufpreis, Wohnfläche, Zimmer, Baujahr und Lage werden automatisch erkannt. Kein manuelles Eintippen.',
  ],
  [
    'Kaufnebenkosten nach Bundesland',
    'Grunderwerbsteuer, Notar und Grundbuch werden anhand des Standorts berechnet. Ohne Recherche.',
  ],
  [
    'Kalkulation läuft live',
    'Jede Zahl lässt sich anpassen. Cashflow, Mietrendite und Cash-on-Cash Return aktualisieren sich sofort.',
  ],
]

export default function FeatureUrlImport() {
  return (
    <SectionEyebrow
      num="01"
      title="Inserat einfügen, Analyse startet"
      subtitle="BrickScore extrahiert Kaufpreis, Fläche und Standort direkt aus dem ImmoScout24-Inserat. Kaufnebenkosten nach Bundesland werden automatisch berechnet."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          alignItems: 'center',
          marginTop: 24,
        }}
      >
        {/* Left: animated paste demo */}
        <div
          style={{
            padding: 32,
            borderRadius: 14,
            background: '#f7f7f4',
            boxShadow: '0 0 0 1px rgba(38,37,30,0.08)',
          }}
        >
          <div
            style={{
              font: '500 10.5px/1 var(--font-space-grotesk), sans-serif',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: 'rgba(38,37,30,0.4)',
              marginBottom: 12,
            }}
          >
            Inserat-Link einfügen
          </div>
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 10,
              background: '#fafaf7',
              border: '1px solid rgba(38,37,30,0.1)',
              font: '500 14px var(--font-jetbrains-mono), monospace',
              color: '#26251e',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(38,37,30,0.45)"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-label="Link-Symbol"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span style={{ opacity: 0.7 }}>immoscout24.de/expose/</span>
            <span>154321987</span>
            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: 14,
                background: '#cf2d56',
                animation: 'v-blink 1s steps(2) infinite',
              }}
            />
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EXTRACTED_FIELDS.map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: 'rgba(242,241,237,0.6)',
                  font: '500 13px var(--font-space-grotesk), sans-serif',
                }}
              >
                <span style={{ color: 'rgba(38,37,30,0.6)' }}>{k}</span>
                <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#26251e' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: narrative bullets */}
        <div style={{ paddingLeft: 24 }}>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {BULLET_POINTS.map(([title, desc]) => (
              <li key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: 9999,
                    background: '#f54e00',
                    marginTop: 9,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      font: '500 16px/1.3 var(--font-space-grotesk), sans-serif',
                      color: '#26251e',
                      letterSpacing: '-0.01em',
                      marginBottom: 4,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      font: '400 14.5px/1.55 var(--font-space-grotesk), sans-serif',
                      color: 'rgba(38,37,30,0.6)',
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionEyebrow>
  )
}
