export default function CtaBand() {
  return (
    <section style={{ padding: '120px 5% 80px' }}>
      <div
        style={{
          padding: '72px 48px',
          borderRadius: 20,
          background: '#26251e',
          color: '#f2f1ed',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: -40,
            width: 200,
            height: 200,
            borderRadius: 9999,
            background: 'rgba(245,78,0,0.15)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />

        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-fraunces), sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(36px, 4.4vw, 56px)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: 720,
            position: 'relative',
          }}
        >
          Bereit für deine{' '}
          <em
            style={{
              fontStyle: 'italic',
              color: '#f54e00',
              fontFamily: 'var(--font-fraunces), sans-serif',
            }}
          >
            erste Analyse?
          </em>
        </h2>

        <p
          style={{
            margin: 0,
            maxWidth: 540,
            font: '400 16px/1.55 var(--font-space-grotesk), sans-serif',
            color: 'rgba(242,241,237,0.7)',
            position: 'relative',
          }}
        >
          Kostenlos starten, keine Kreditkarte nötig. Erste Kalkulation in 30 Sekunden.
        </p>

        <div style={{ display: 'inline-flex', gap: 10, position: 'relative' }}>
          <a href="#calculator" className="v-cta-primary v-cta-primary--invert">
            Jetzt Rendite berechnen
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
          <button className="v-cta-secondary v-cta-secondary--invert">Demo ansehen</button>
        </div>
      </div>
    </section>
  )
}
