'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
}

export default function LegalPageLayout({ title, children }: Props) {
  const router = useRouter()
  const goBack = () => {
    if (typeof window === 'undefined') return
    const sameOrigin = document.referrer && document.referrer.includes(window.location.host)
    if (window.history.length > 1 && sameOrigin) {
      router.back()
    } else {
      router.push('/dashboard/settings')
    }
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
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
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
            margin: '0 0 32px',
            color: '#1C1C1C',
          }}
        >
          {title}
        </h1>

        <article
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: '#1C1C1C',
          }}
        >
          {children}
        </article>
      </div>
    </div>
  )
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
        margin: '40px 0 16px',
        color: '#1C1C1C',
      }}
    >
      {children}
    </h2>
  )
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3
      style={{
        fontSize: 16,
        fontWeight: 700,
        lineHeight: 1.4,
        margin: '28px 0 8px',
        color: '#1C1C1C',
      }}
    >
      {children}
    </h3>
  )
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.7, color: '#1C1C1C' }}>
      {children}
    </p>
  )
}

export function Address({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: '0 0 16px',
        fontSize: 15,
        lineHeight: 1.7,
        color: '#1C1C1C',
        whiteSpace: 'pre-line',
      }}
    >
      {children}
    </p>
  )
}

export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
      [{children}]
    </span>
  )
}

export function Stand() {
  const date = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  return (
    <p
      style={{
        margin: '40px 0 0',
        fontSize: 13,
        color: '#9CA3AF',
        fontStyle: 'italic',
      }}
    >
      Stand: {date}
    </p>
  )
}
