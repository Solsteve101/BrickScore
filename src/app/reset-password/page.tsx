'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthShell from '@/components/auth/AuthShell'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthShell><div /></AuthShell>}>
      <ResetPasswordInner />
    </Suspense>
  )
}

function ResetPasswordInner() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancel = false
    if (!token) { setTokenStatus('invalid'); return }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({})) as { valid?: boolean }
        if (cancel) return
        setTokenStatus(json.valid ? 'valid' : 'invalid')
      })
      .catch(() => { if (!cancel) setTokenStatus('invalid') })
    return () => { cancel = true }
  }, [token])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setError(null)
    if (password.length < 8) { setError('Passwort muss mindestens 8 Zeichen haben.'); return }
    if (password !== confirm) { setError('Die Passwörter stimmen nicht überein.'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const json = await res.json().catch(() => ({})) as { ok?: boolean; message?: string }
      if (!res.ok || !json.ok) {
        setError(json.message ?? 'Passwort konnte nicht aktualisiert werden.')
        return
      }
      router.replace('/login?reset=success')
    } catch {
      setError('Passwort konnte nicht aktualisiert werden.')
    } finally { setBusy(false) }
  }

  return (
    <AuthShell>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ margin: 0, font: '700 32px/1.15 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
          Neues Passwort setzen
        </h1>
        <p style={{ margin: 0, font: '400 14px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
          Wähle ein neues Passwort für dein BrickScore-Konto.
        </p>
      </header>

      {tokenStatus === 'checking' && (
        <div style={{ font: '400 13px/1.5 var(--font-dm-sans), sans-serif', color: '#7a7a7a' }}>
          Link wird geprüft…
        </div>
      )}

      {tokenStatus === 'invalid' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(207,45,86,0.08)', border: '1px solid rgba(207,45,86,0.25)', font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#cf2d56' }}>
            Der Link ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.
          </div>
          <Link href="/forgot-password" style={{ color: '#0a0a0a', textDecoration: 'underline', textUnderlineOffset: 3, font: '500 13.5px/1 var(--font-dm-sans), sans-serif' }}>
            Neuen Link anfordern
          </Link>
        </div>
      )}

      {tokenStatus === 'valid' && (
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field
            label="Neues Passwort"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
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
          <Field
            label="Passwort bestätigen"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={setConfirm}
          />

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
            {busy ? 'Speichern…' : 'Neues Passwort setzen'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}

function Field({
  label, type, value, onChange, autoComplete, required, trailing,
}: {
  label: string; type: string; value: string; onChange: (v: string) => void
  autoComplete?: string; required?: boolean; trailing?: React.ReactNode
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
        {trailing}
      </span>
    </label>
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
