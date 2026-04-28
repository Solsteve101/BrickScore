export default function TrustStatement() {
  return (
    <section
      id="about"
      className="bs-trust-section"
      style={{
        padding: '80px 5%',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 80,
        scrollMarginTop: '5px',
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            font: '700 clamp(20px, 2.5vw, 30px)/1.2 var(--font-dm-sans), sans-serif',
            letterSpacing: '-0.02em',
            color: '#0a0a0a',
          }}
        >
          Wir arbeiten nur für dich.
        </div>
      </div>
      <div className="bs-trust-divider" style={{ width: 1, height: 40, background: '#e5e5e5', flexShrink: 0 }} />
      <p
        style={{
          margin: 0,
          font: '400 15px/1.65 var(--font-dm-sans), sans-serif',
          color: '#6a6a6a',
          maxWidth: 620,
        }}
      >
        BrickScore verkauft keine Immobilien und erhält keine Provisionen.
        Wir berechnen ausschließlich auf Basis deiner Eingaben und öffentlicher Daten.
        Keine Empfehlungen, kein Bias, nur Zahlen.
      </p>
      <style>{`
        @media (max-width: 768px) {
          .bs-trust-section {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .bs-trust-divider {
            width: 100% !important;
            height: 1px !important;
          }
        }
      `}</style>
    </section>
  )
}
