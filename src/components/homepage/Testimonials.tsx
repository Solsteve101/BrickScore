import SectionEyebrow from './SectionEyebrow'

interface Testimonial {
  q: string
  a: string
  r: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    q: 'Früher hab ich Immobilien nach Bauchgefühl gekauft. Heute analysiere ich ein Inserat in 30 Sekunden und weiß sofort, ob sich die Rendite rechnet.',
    a: 'Julia Krämer',
    r: 'Buy-and-Hold-Investorin, 14 Einheiten',
  },
  {
    q: 'Endlich ein Cashflow Rechner, der die deutschen Kaufnebenkosten versteht. Die Berechnung nach Bundesland läuft automatisch. Das spart mir in jedem Deal eine Viertelstunde.',
    a: 'Thomas Weber',
    r: 'Family Office, Süddeutschland',
  },
  {
    q: 'BrickScore ist bei uns Standard im Bankgespräch. Mietrendite, Cashflow, Cash-on-Cash Return — alle Zahlen sind auf Knopfdruck vorhanden.',
    a: 'Carla Reinhardt',
    r: 'Asset Managerin, Berlin',
  },
]

export default function Testimonials() {
  return (
    <SectionEyebrow
      num="04"
      title="Was Investoren über BrickScore sagen"
      subtitle="Von privaten Käufern bis zu Family Offices."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginTop: 24,
        }}
      >
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={i}
            style={{
              margin: 0,
              padding: 28,
              borderRadius: 12,
              background: '#f7f7f4',
              boxShadow: '0 0 0 1px rgba(38,37,30,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f54e00"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
            </svg>
            <blockquote
              style={{
                margin: 0,
                fontFamily: 'var(--font-fraunces), sans-serif',
                fontWeight: 400,
                fontSize: 19,
                lineHeight: 1.4,
                color: '#26251e',
                letterSpacing: '-0.015em',
              }}
            >
              „{t.q}"
            </blockquote>
            <figcaption
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                paddingTop: 16,
                borderTop: '1px solid rgba(38,37,30,0.08)',
              }}
            >
              <span
                style={{
                  font: '500 14px/1.2 var(--font-space-grotesk), sans-serif',
                  color: '#26251e',
                }}
              >
                {t.a}
              </span>
              <span
                style={{
                  font: '500 12px/1.2 var(--font-space-grotesk), sans-serif',
                  color: 'rgba(38,37,30,0.55)',
                }}
              >
                {t.r}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionEyebrow>
  )
}
