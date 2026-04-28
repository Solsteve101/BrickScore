'use client'

import { useRouter } from 'next/navigation'

const SUPPORT_EMAIL = 'brickscore.support@gmail.com'

export default function KontaktPage() {
  const router = useRouter()

  const goBack = () => {
    if (typeof window === 'undefined') return
    const sameOrigin = document.referrer && document.referrer.includes(window.location.host)
    if (window.history.length > 1 && sameOrigin) router.back()
    else router.push('/')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F9F8F6',
        padding: '32px 24px 96px',
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        color: '#1C1C1C',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button
          type="button"
          onClick={goBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
            color: '#6F6F6F',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'inherit',
            textDecoration: 'none',
            marginBottom: 40,
            transition: 'color 130ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#1C1C1C' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6F6F6F' }}
        >
          <span aria-hidden="true">←</span>
          <span>Zurück</span>
        </button>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: '0 0 12px',
            color: '#1C1C1C',
            textAlign: 'center',
          }}
        >
          Kontakt
        </h1>
        <p
          style={{
            margin: '0 0 32px',
            fontSize: 15,
            lineHeight: 1.6,
            color: '#6F6F6F',
            textAlign: 'center',
          }}
        >
          Fragen, Feedback oder Support? Wir helfen gerne.
        </p>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E6E6E4',
            borderRadius: 10,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            textAlign: 'center',
          }}
        >
          <MailIcon />
          <span
            style={{
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#9CA3AF',
              fontWeight: 500,
            }}
          >
            E-Mail
          </span>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: '#1C1C1C',
              textDecoration: 'none',
              transition: 'color 130ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#2C2C2C' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#1C1C1C' }}
          >
            {SUPPORT_EMAIL}
          </a>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 14,
              lineHeight: 1.5,
              color: '#6F6F6F',
            }}
          >
            Wir antworten in der Regel innerhalb von 24 Stunden.
          </p>
        </div>

        <p
          style={{
            margin: '24px 0 0',
            fontSize: 14,
            lineHeight: 1.6,
            color: '#6F6F6F',
            textAlign: 'center',
          }}
        >
          Du kannst uns auch direkt eine E-Mail senden an{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            style={{ color: '#1C1C1C', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            {SUPPORT_EMAIL}
          </a>
          {' '}— wir freuen uns über jede Nachricht.
        </p>
      </div>
    </div>
  )
}

function MailIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6F6F6F"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
