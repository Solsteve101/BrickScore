import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F9F8F6',
        padding: '24px',
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ position: 'relative', textAlign: 'center', maxWidth: '560px', width: '100%' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -52%)',
            fontSize: 'clamp(200px, 40vw, 350px)',
            fontWeight: 800,
            color: '#DDDDD8',
            lineHeight: 1,
            letterSpacing: '-0.05em',
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          404
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            paddingTop: '72px',
            paddingBottom: '72px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              color: '#9CA3AF',
              letterSpacing: '-0.01em',
              fontWeight: 500,
            }}
          >
            brickscore
          </span>

          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#1C1C1C',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Seite nicht gefunden
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#6F6F6F',
              margin: 0,
              lineHeight: 1.5,
              maxWidth: '420px',
            }}
          >
            Die angeforderte Seite existiert nicht oder wurde verschoben.
          </p>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: '#1C1C1C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              marginTop: 4,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2C2C2C' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1C1C1C' }}
          >
            Zur Startseite →
          </Link>
        </div>
      </div>
    </div>
  )
}
