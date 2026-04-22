'use client'

function ImmoScout24Logo() {
  return (
    <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
      Immo<span style={{ fontWeight: 800 }}>Scout</span><span style={{ fontSize: 18, fontWeight: 700, opacity: 0.6 }}>24</span>
    </span>
  )
}

function ImmoweltLogo() {
  return (
    <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      Immowelt
    </span>
  )
}

function KleinanzeigenLogo() {
  return (
    <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
      Kleinanzeigen
    </span>
  )
}

function EngelVoelkersLogo() {
  return (
    <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 18, fontWeight: 400, letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      Engel &amp; Völkers
    </span>
  )
}

function ImmonetLogo() {
  return (
    <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
      immonet
    </span>
  )
}

function EbayKleinanzeigenLogo() {
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 22, fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.03em' }}>eBay </span>
      <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 16, fontWeight: 400, letterSpacing: '-0.01em' }}>Kleinanzeigen</span>
    </span>
  )
}

function ImmobilienDeLogo() {
  return (
    <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 20, fontWeight: 300, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
      immobilien.de
    </span>
  )
}

function WohnungsboerseLogo() {
  return (
    <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 18, fontWeight: 500, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
      Wohnungsboerse
    </span>
  )
}

const LOGOS = [
  <ImmoScout24Logo key="immoscout" />,
  <ImmoweltLogo key="immowelt" />,
  <KleinanzeigenLogo key="kleinanzeigen" />,
  <EngelVoelkersLogo key="engel" />,
  <ImmonetLogo key="immonet" />,
  <EbayKleinanzeigenLogo key="ebay" />,
  <ImmobilienDeLogo key="immobiliende" />,
  <WohnungsboerseLogo key="wohnungsboerse" />,
]

export default function PortalWall() {
  return (
    <section style={{ background: '#fff', padding: '28px 0' }}>
      {/* Label */}
      <p
        style={{
          margin: '0 0 18px',
          textAlign: 'center',
          font: '500 10.5px/1 var(--font-dm-sans), sans-serif',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#0a0a0a',
        }}
      >
        Kompatibel mit
      </p>

      {/* Scroll track */}
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        {/* Left fade */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 150,
          background: 'linear-gradient(to right, #ffffff, transparent)',
          zIndex: 10, pointerEvents: 'none',
        }} />
        {/* Right fade */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 150,
          background: 'linear-gradient(to left, #ffffff, transparent)',
          zIndex: 10, pointerEvents: 'none',
        }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: 'max-content',
            animation: 'portalScroll 80s linear infinite',
            color: '#1a1a1a',
            opacity: 0.38,
          }}
        >
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <span key={i} style={{ padding: '0 52px' }}>
              {logo}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes portalScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
