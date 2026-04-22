export default function CtaBand() {
  return (
    <section style={{ padding: '0 5% 0', background: '#fff', borderTop: '1px solid #e5e5e5' }}>
      <div
        style={{
          background: '#0f0f0f',
          borderRadius: 16,
          padding: '96px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 28,
          margin: '80px 0 80px',
        }}
      >
        {/* Small mark */}
        <svg viewBox="0 0 120 100" width={28} height={23} aria-hidden="true">
          <path d="M60,52 L28,84 L28,70 L60,38 L92,70 L92,84 Z" fill="rgba(255,255,255,0.3)" />
          <path d="M52,32 L60,24 L100,24 L92,32 Z" fill="rgba(255,255,255,0.3)" />
        </svg>

        <h2
          style={{
            margin: 0,
            font: '700 clamp(32px, 4vw, 56px)/1.06 var(--font-dm-sans), sans-serif',
            letterSpacing: '-0.03em',
            color: '#f0f0f0',
            maxWidth: 640,
          }}
        >
          Dein persönlicher{' '}
          <span style={{ color: '#b8921a' }}>Immobilien-Rechner.</span>
        </h2>

        <p
          style={{
            margin: 0,
            font: '400 15px/1.6 var(--font-dm-sans), sans-serif',
            color: 'rgba(240,240,240,0.55)',
            maxWidth: 480,
          }}
        >
          Vom Inserat zur Rendite in unter einer Minute.
          Kostenlos starten, keine Kreditkarte nötig.
        </p>

        <div style={{ display: 'inline-flex', gap: 10 }}>
          <a
            href="#calculator"
            className="cp-cta-pill cp-cta-pill-invert"
            style={{ padding: '13px 28px', fontSize: 15 }}
          >
            Jetzt berechnen
          </a>
          <a
            href="#features"
            className="cp-cta-ghost cp-cta-ghost-invert"
            style={{ padding: '13px 24px', fontSize: 15 }}
          >
            Demo ansehen
          </a>
        </div>
      </div>
    </section>
  )
}
