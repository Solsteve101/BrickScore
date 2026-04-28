'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }, [error])

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
      <div style={{ position: 'relative', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
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
          Error
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
            Etwas ist schiefgelaufen
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#6F6F6F',
              margin: 0,
              lineHeight: 1.5,
              maxWidth: '440px',
            }}
          >
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '4px',
            }}
          >
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
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#2C2C2C' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1C1C1C' }}
            >
              Zur Startseite →
            </Link>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#FFFFFF',
                color: '#1C1C1C',
                border: '1px solid #D6D6D4',
                borderRadius: 10,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F5F3' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF' }}
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
