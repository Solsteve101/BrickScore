'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthShell from '@/components/auth/AuthShell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        setError('Anfrage fehlgeschlagen. Bitte versuche es erneut.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Anfrage fehlgeschlagen. Bitte versuche es erneut.')
    } finally { setBusy(false) }
  }

  return (
    <AuthShell>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ margin: 0, font: '700 32px/1.15 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
          Passwort vergessen
        </h1>
        <p style={{ margin: 0, font: '400 14px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
          Gib deine E-Mail ein und wir senden dir einen Link zum Zurücksetzen.
        </p>
      </header>

      {submitted ? (
        <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(31,138,101,0.08)', border: '1px solid rgba(31,138,101,0.25)', font: '400 14px/1.55 var(--font-dm-sans), sans-serif', color: '#1a6a45' }}>
          Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link gesendet.
        </div>
      ) : (
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="E-Mail" type="email" autoComplete="email" required value={email} onChange={setEmail} />

          {error && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(207,45,86,0.08)', border: '1px solid rgba(207,45,86,0.2)', font: '400 13px/1.4 var(--font-dm-sans), sans-serif', color: '#cf2d56' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 4, width: '100%', padding: '13px 16px',
              background: 'linear-gradient(to bottom, #3d3d3d, #141414)',
              color: '#ffffff', borderRadius: 10, border: '1px solid rgba(0,0,0,0.5)',
              font: '500 14.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: '-0.1px',
              cursor: busy ? 'default' : 'pointer',
              opacity: busy ? 0.75 : 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {busy ? 'Senden…' : 'Link senden'}
          </button>
        </form>
      )}

      <p style={{ margin: 0, textAlign: 'center', font: '400 13.5px/1 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
        <Link href="/login" style={{ color: '#0a0a0a', fontWeight: 500, textDecoration: 'none' }}>
          Zurück zum Login
        </Link>
      </p>
    </AuthShell>
  )
}

function Field({
  label, type, value, onChange, autoComplete, required,
}: {
  label: string; type: string; value: string; onChange: (v: string) => void
  autoComplete?: string; required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ font: '500 12px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.2, color: '#4a4a4a' }}>{label}</span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '11px 12px', borderRadius: 9, background: '#ffffff',
        border: `1px solid ${focused ? '#0a0a0a' : '#d8d8d8'}`,
        transition: 'border-color 140ms ease',
      }}>
        <input
          type={type}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            font: '400 14.5px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a',
            minWidth: 0, padding: 0,
          }}
        />
      </span>
    </label>
  )
}
