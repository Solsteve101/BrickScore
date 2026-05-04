'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import AuthShell from '@/components/auth/AuthShell'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/'
  const resetSuccess = params.get('reset') === 'success'
  const { status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') router.replace(callbackUrl)
  }, [status, router, callbackUrl])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'google' | 'creds' | null>(null)

  const onCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading('creds')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError('E-Mail oder Passwort ist falsch.')
      setLoading(null)
      return
    }
    router.push(callbackUrl)
    router.refresh()
  }

  const onGoogle = async () => {
    if (loading) return
    setLoading('google')
    await signIn('google', { callbackUrl })
  }

  return (
    <AuthShell>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ margin: 0, font: '700 32px/1.15 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
          Registrieren oder anmelden
        </h1>
        <p style={{ margin: 0, font: '400 14px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
          Melde dich an um deine Deals zu speichern und zu vergleichen.
        </p>
      </header>

      <button
        type="button"
        onClick={onGoogle}
        disabled={loading !== null}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          width: '100%',
          padding: '10px 24px',
          background: '#FFFFFF',
          border: '1px solid #D6D6D4',
          borderRadius: 10,
          color: '#1C1C1C',
          font: '500 14px/1 var(--font-dm-sans), sans-serif',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading === 'google' ? 0.7 : 1,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#F5F5F3' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF' }}
      >
        <GoogleG />
        {loading === 'google' ? 'Weiterleiten…' : 'Mit Google anmelden'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
        <span style={{ height: 1, background: '#e5e5e5' }} />
        <span style={{ font: '500 11px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#9a9a9a' }}>oder</span>
        <span style={{ height: 1, background: '#e5e5e5' }} />
      </div>

      {resetSuccess && (
        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(31,138,101,0.10)', border: '1px solid rgba(31,138,101,0.25)', font: '400 13px/1.45 var(--font-dm-sans), sans-serif', color: '#1a6a45' }}>
          Passwort erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.
        </div>
      )}

      <form onSubmit={onCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field
          label="E-Mail"
          type="email"
          autoComplete="off"
          required
          value={email}
          onChange={setEmail}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Field
            label="Passwort"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={setPassword}
            trailing={
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Passwort verbergen' : 'Passwort anzeigen'}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#9a9a9a', display: 'inline-flex', alignItems: 'center' }}
              >
                <EyeIcon open={showPw} />
              </button>
            }
          />
          <Link href="/forgot-password" style={{ alignSelf: 'flex-end', font: '500 12.5px/1 var(--font-dm-sans), sans-serif', color: '#6a6a6a', textDecoration: 'none' }}>
            Passwort vergessen?
          </Link>
        </div>

        {error && (
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(207,45,86,0.08)', border: '1px solid rgba(207,45,86,0.2)', font: '400 13px/1.4 var(--font-dm-sans), sans-serif', color: '#cf2d56' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading !== null}
          style={{
            marginTop: 4,
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 24px',
            background: '#1C1C1C',
            color: '#FFFFFF',
            borderRadius: 10,
            border: 'none',
            font: '500 14px/1 var(--font-dm-sans), sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading === 'creds' ? 0.75 : 1,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#2C2C2C' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#1C1C1C' }}
        >
          {loading === 'creds' ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>

      <p style={{ margin: 0, textAlign: 'center', font: '400 13.5px/1 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
        Noch kein Konto?{' '}
        <Link href="/signup" style={{ color: '#0a0a0a', fontWeight: 500, textDecoration: 'none' }}>
          Jetzt registrieren
        </Link>
      </p>
    </AuthShell>
  )
}

function Field({
  label, type, value, onChange, autoComplete, required, trailing,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  required?: boolean
  trailing?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ font: '500 12px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.2, color: '#4a4a4a' }}>{label}</span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '11px 12px', borderRadius: 9,
        background: '#ffffff',
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
        {trailing}
      </span>
    </label>
  )
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.32z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.5 10.5 0 0 1 12 19c-6.5 0-10-7-10-7a17.4 17.4 0 0 1 4.06-4.94" />
      <path d="M9.9 4.24A10.5 10.5 0 0 1 12 4c6.5 0 10 7 10 7a17.5 17.5 0 0 1-3.06 4.06" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}
