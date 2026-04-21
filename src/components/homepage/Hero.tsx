export default function Hero() {
  return (
    <section
      style={{
        padding: '88px 5% 44px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 26,
      }}
    >
      {/* Eyebrow chip */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px 6px 8px',
          borderRadius: 9999,
          background: '#f7f7f4',
          boxShadow: '0 0 0 1px rgba(38,37,30,0.1)',
          font: '500 12px/1 var(--font-space-grotesk), sans-serif',
          color: 'rgba(38,37,30,0.7)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: '#1f8a65',
          }}
        />
        <span>Immobilien Rendite Rechner für Deutschland</span>
      </div>

      {/* H1 — primary SEO target: Immobilien Rendite Rechner */}
      <h1
        style={{
          margin: 0,
          fontFamily: 'var(--font-fraunces), sans-serif',
          fontWeight: 400,
          fontSize: 'clamp(48px, 7vw, 88px)',
          lineHeight: 0.98,
          letterSpacing: '-0.035em',
          color: '#26251e',
          maxWidth: 900,
        }}
      >
        Rendite berechnen.{' '}
        <em
          style={{
            fontStyle: 'italic',
            color: '#cf2d56',
            fontFamily: 'var(--font-fraunces), sans-serif',
          }}
        >
          Nicht schätzen.
        </em>
      </h1>

      {/* Subline — hits: Immobilien Investment Rechner Deutschland, Kaufnebenkosten, Cashflow, Mietrendite */}
      <p
        style={{
          margin: 0,
          maxWidth: 640,
          font: '400 19px/1.5 var(--font-space-grotesk), sans-serif',
          color: 'rgba(38,37,30,0.66)',
          letterSpacing: '-0.01em',
        }}
      >
        BrickScore liest dein ImmoScout24-Inserat und berechnet Kaufnebenkosten, Cashflow und Mietrendite.
        Sofort, ohne Excel.
      </p>

      {/* CTAs */}
      <div style={{ display: 'inline-flex', gap: 10, marginTop: 10 }}>
        <a href="#calculator" className="v-cta-primary">
          Kostenlos analysieren
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
        <button className="v-cta-secondary">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
          Demo ansehen
        </button>
      </div>

      {/* Trust micro-line */}
      <div
        style={{
          marginTop: 6,
          font: '500 12.5px/1 var(--font-space-grotesk), sans-serif',
          color: 'rgba(38,37,30,0.45)',
          letterSpacing: '0.1px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <span>Kostenlos · keine Kreditkarte · fertig in 30 Sekunden</span>
      </div>
    </section>
  )
}
