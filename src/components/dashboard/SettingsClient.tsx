'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { pushToast } from '@/lib/toast'

const COMING_SOON_MSG = 'Diese Funktion wird bald verfügbar sein.'

type SectionKey = 'profile' | 'password' | 'notifications' | 'imprint' | 'privacy' | 'terms' | 'delete'

const SECTIONS: { key: SectionKey; label: string; icon: ReactNode; danger?: boolean }[] = [
  {
    key: 'profile', label: 'Profil',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
  {
    key: 'password', label: 'Passwort ändern',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  },
  {
    key: 'notifications', label: 'Benachrichtigungen',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>,
  },
  {
    key: 'imprint', label: 'Impressum',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  },
  {
    key: 'privacy', label: 'Datenschutzerklärung',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  },
  {
    key: 'terms', label: 'AGB',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" /><line x1="9" y1="9" x2="17" y2="9" /><line x1="9" y1="13" x2="17" y2="13" /></svg>,
  },
  {
    key: 'delete', label: 'Konto löschen', danger: true,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>,
  },
]

export default function SettingsClient() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: session, update } = useSession()
  const user = session?.user
  const isGoogle = user?.provider === 'google'
  const [open, setOpen] = useState<SectionKey | null>(null)

  useEffect(() => {
    const e = params.get('email')
    if (!e) return
    if (e === 'confirmed') pushToast({ variant: 'success', message: 'E-Mail-Adresse erfolgreich aktualisiert. Bitte melde dich erneut an.' })
    else if (e === 'invalid') pushToast({ variant: 'error', message: 'Der Bestätigungs-Link ist ungültig oder abgelaufen.' })
    else if (e === 'taken') pushToast({ variant: 'error', message: 'Diese E-Mail ist bereits vergeben.' })
    const url = new URL(window.location.href)
    url.searchParams.delete('email')
    router.replace(url.pathname + (url.search || ''))
  }, [params, router])

  return (
    <div style={{ padding: '36px 40px 60px', maxWidth: 760 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
        <h1 style={{ margin: 0, font: '700 28px/1.2 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
          Einstellungen
        </h1>
        <p style={{ margin: 0, font: '400 14.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
          Verwalte dein Profil und Konto.
        </p>
      </header>

      {/* Mobile-only quick links to Nutzung & Abonnement (sidebar items missing on mobile) */}
      <div className="bs-settings-mobile-links" style={{ display: 'none', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        <Link href="/dashboard/usage" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, border: '1px solid #E6E6E4', background: '#ffffff', color: '#1C1C1C', font: '500 14px/1 var(--font-dm-sans), sans-serif', textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="20" x2="3" y2="10" /><line x1="9" y1="20" x2="9" y2="6" /><line x1="15" y1="20" x2="15" y2="13" /><line x1="21" y1="20" x2="21" y2="4" /></svg>
          Nutzung
        </Link>
        <Link href="/dashboard/subscription" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, border: '1px solid #E6E6E4', background: '#ffffff', color: '#1C1C1C', font: '500 14px/1 var(--font-dm-sans), sans-serif', textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
          Abonnement
        </Link>
      </div>

      <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #ececec', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {SECTIONS.map((s, i) => {
          const isOpen = open === s.key
          return (
            <div key={s.key} style={{ borderBottom: i < SECTIONS.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : s.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 20px',
                  background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                  font: '500 14.5px/1.3 var(--font-dm-sans), sans-serif',
                  color: s.danger ? '#cf2d56' : '#0a0a0a',
                  transition: 'background 130ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fafaf8' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ color: s.danger ? '#cf2d56' : '#7a7a7a', flexShrink: 0 }}>{s.icon}</span>
                <span style={{ flex: 1 }}>{s.label}</span>
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none" style={{ color: '#9a9a9a', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 180ms ease' }}>
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && (
                <div style={{ padding: '4px 24px 22px' }}>
                  {s.key === 'profile' && <ProfileSection user={user ?? null} update={update} />}
                  {s.key === 'password' && <PasswordSection isGoogle={isGoogle} />}
                  {s.key === 'notifications' && <NotificationsSection />}
                  {s.key === 'imprint' && (
                    <LegalLinkSection
                      text="Anbieterkennzeichnung gemäß § 5 DDG."
                      href="/impressum"
                    />
                  )}
                  {s.key === 'privacy' && (
                    <LegalLinkSection
                      text="Hinweise zur Verarbeitung personenbezogener Daten und zu deinen Rechten nach DSGVO."
                      href="/datenschutz"
                    />
                  )}
                  {s.key === 'terms' && (
                    <LegalLinkSection
                      text="Allgemeine Geschäftsbedingungen für die Nutzung von BrickScore."
                      href="/agb"
                    />
                  )}
                  {s.key === 'delete' && <DeleteSection onConfirmed={async () => {
                    try { ['brickscore_deals_v1', 'brickscore_exports', 'brickscore_usage'].forEach((k) => window.localStorage.removeItem(k)) } catch { /* ignore */ }
                    await signOut({ redirect: false })
                    router.replace('/')
                    router.refresh()
                  }} />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProfileSection({ user, update: _update }: { user: ReturnType<typeof useSession>['data'] extends infer S ? (S extends { user: infer U } ? U : null) : null; update: ReturnType<typeof useSession>['update'] }) {
  const originalEmail = user?.email ?? ''
  const [name, setName] = useState(user?.name ?? '')
  const [emailValue, setEmailValue] = useState(originalEmail)
  const [pwModalOpen, setPwModalOpen] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [busy, setBusy] = useState(false)
  const isGoogle = user?.provider === 'google'
  const initial = (name || originalEmail || '?').trim().charAt(0).toUpperCase()

  useEffect(() => { if (user?.name) setName(user.name) }, [user?.name])
  useEffect(() => { if (user?.email) setEmailValue(user.email) }, [user?.email])

  const emailChanged = emailValue.trim().toLowerCase() !== originalEmail.toLowerCase() && emailValue.trim().length > 0

  const handleSave = () => {
    if (emailChanged && !isGoogle) {
      setPwInput('')
      setPwModalOpen(true)
      return
    }
    pushToast({ variant: 'info', message: COMING_SOON_MSG })
  }

  const submitEmailChange = async () => {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: emailValue.trim(), password: pwInput }),
      })
      const json = await res.json().catch(() => ({})) as { ok?: boolean; message?: string }
      if (!res.ok || !json.ok) {
        pushToast({ variant: 'error', message: json.message ?? 'E-Mail konnte nicht geändert werden.' })
        return
      }
      setPwModalOpen(false)
      setPwInput('')
      pushToast({ variant: 'success', message: 'Bestätigungslink wurde an deine neue E-Mail gesendet.' })
    } catch (e) {
      pushToast({ variant: 'error', message: e instanceof Error ? e.message : 'E-Mail konnte nicht geändert werden.' })
    } finally { setBusy(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{
          width: 56, height: 56, minWidth: 56, minHeight: 56, flexShrink: 0,
          aspectRatio: '1 / 1', borderRadius: '50%',
          background: user?.image ? `url(${user.image}) center/cover no-repeat` : 'linear-gradient(135deg, #3d3d3d, #141414)',
          color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          font: '600 22px/1 var(--font-dm-sans), sans-serif',
        }}>
          {!user?.image && initial}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={labelStyle}>Profilbild</span>
          <span style={{ font: '400 12.5px/1.4 var(--font-dm-sans), sans-serif', color: '#7a7a7a' }}>
            Wird automatisch aus deinen Initialen generiert.
          </span>
        </div>
      </div>

      <Field label="Name">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dein Name" style={inputStyle} />
      </Field>

      <Field label="E-Mail">
        {isGoogle ? (
          <>
            <input value={originalEmail} disabled style={{ ...inputStyle, background: '#fafafa', color: '#7a7a7a', cursor: 'not-allowed' }} />
            <span style={hintStyle}>Verknüpft mit Google.</span>
          </>
        ) : (
          <input
            type="email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            placeholder="deine@email.de"
            style={inputStyle}
            autoComplete="email"
          />
        )}
      </Field>

      <button type="button" onClick={handleSave} disabled={busy} style={primaryBtn(busy)}>
        {busy ? 'Speichern…' : 'Profil speichern'}
      </button>

      {pwModalOpen && (
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) setPwModalOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{ width: '100%', maxWidth: 440, background: '#ffffff', borderRadius: 12, padding: '22px 24px 20px', boxShadow: '0 24px 48px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ margin: 0, font: '600 17px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>
              Passwort bestätigen
            </h3>
            <p style={{ margin: 0, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
              Gib dein aktuelles Passwort ein, um die E-Mail-Adresse zu ändern. Wir senden einen Bestätigungslink an die neue Adresse.
            </p>
            <Field label="Aktuelles Passwort">
              <input
                type="password"
                value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                autoComplete="current-password"
                style={inputStyle}
              />
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => { if (!busy) setPwModalOpen(false) }}
                disabled={busy}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', borderRadius: 10, background: '#FFFFFF', border: '1px solid #D6D6D4', font: '500 14px/1 var(--font-dm-sans), Inter, sans-serif', color: '#1C1C1C', cursor: busy ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease' }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => { void submitEmailChange() }}
                disabled={busy || pwInput.length === 0}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px 16px', borderRadius: 10,
                  background: '#1C1C1C',
                  border: 'none',
                  font: '500 14px/1 var(--font-dm-sans), Inter, sans-serif',
                  color: '#FFFFFF',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy || pwInput.length === 0 ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {busy ? 'Senden…' : 'Bestätigen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PasswordSection({ isGoogle }: { isGoogle: boolean }) {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [busy, setBusy] = useState(false)

  const handleChange = async () => {
    if (busy) return
    if (newPw.length < 8) {
      pushToast({ variant: 'error', message: 'Neues Passwort muss mindestens 8 Zeichen haben.' })
      return
    }
    if (newPw !== confirmPw) {
      pushToast({ variant: 'error', message: 'Die Passwörter stimmen nicht überein.' })
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw, confirmPassword: confirmPw }),
      })
      const json = await res.json().catch(() => ({})) as { ok?: boolean; message?: string }
      if (!res.ok || !json.ok) {
        pushToast({ variant: 'error', message: json.message ?? 'Passwort konnte nicht geändert werden.' })
        return
      }
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      pushToast({ variant: 'success', message: 'Passwort erfolgreich geändert.' })
    } catch (e) {
      pushToast({ variant: 'error', message: e instanceof Error ? e.message : 'Passwort konnte nicht geändert werden.' })
    } finally { setBusy(false) }
  }

  if (isGoogle) {
    return (
      <p style={{ margin: 0, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
        Du hast dich mit Google angemeldet. Passwort wird über Google verwaltet.
      </p>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Field label="Aktuelles Passwort">
        <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} autoComplete="current-password" style={inputStyle} />
      </Field>
      <Field label="Neues Passwort">
        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" style={inputStyle} />
      </Field>
      <Field label="Neues Passwort bestätigen">
        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" style={inputStyle} />
      </Field>
      <button type="button" onClick={() => { void handleChange() }} disabled={busy} style={primaryBtn(busy)}>
        {busy ? 'Speichern…' : 'Passwort ändern'}
      </button>
    </div>
  )
}

function NotificationsSection() {
  const [productMail, setProductMail] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ToggleRow
        label="Produkt-Updates per E-Mail"
        sub="Wichtige Neuerungen rund um BrickScore."
        value={productMail}
        onChange={setProductMail}
      />
      <ToggleRow
        label="Wöchentlicher Markt-Digest"
        sub="Trends und Insights aus deinen analysierten Regionen."
        value={weeklyDigest}
        onChange={setWeeklyDigest}
      />
      <span style={hintStyle}>Platzhalter — wird vor Launch aktiviert.</span>
    </div>
  )
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '6px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ font: '500 13.5px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>{label}</span>
        <span style={{ font: '400 12.5px/1.4 var(--font-dm-sans), sans-serif', color: '#7a7a7a' }}>{sub}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        style={{
          width: 36, height: 20, borderRadius: 9999,
          background: value ? '#0a0a0a' : 'rgba(38,37,30,0.18)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 150ms ease', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: value ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%', background: '#ffffff',
          transition: 'left 150ms ease',
        }} />
      </button>
    </div>
  )
}

function PlaceholderSection({ text }: { text: string }) {
  return (
    <p style={{ margin: 0, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
      {text}
    </p>
  )
}

function LegalLinkSection({ text, href }: { text: string; href: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
        {text}
      </p>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          alignSelf: 'flex-start',
          font: '500 13px/1 var(--font-dm-sans), sans-serif',
          color: '#0a0a0a',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        Vollständig ansehen <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}

function DeleteSection({ onConfirmed }: { onConfirmed: () => Promise<void> }) {
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)

  const doDelete = async () => {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'POST' })
      if (!res.ok) { setBusy(false); return }
      await onConfirmed()
    } catch { setBusy(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
        Lösche dein Konto und alle damit verknüpften Daten unwiderruflich.
      </p>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="bs-delete-account-btn"
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '10px 24px', borderRadius: 10,
          background: '#FFFFFF', color: '#DC2626',
          border: '1px solid #D6D6D4',
          font: '500 14px/1.3 var(--font-dm-sans), Inter, sans-serif',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          maxWidth: '100%',
          textAlign: 'center',
        }}
      >
        Konto und alle Daten unwiderruflich löschen
      </button>

      {confirm && (
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) setConfirm(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{ width: '100%', maxWidth: 440, background: '#ffffff', borderRadius: 12, padding: '22px 24px 20px', boxShadow: '0 24px 48px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ margin: 0, font: '600 17px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>Konto wirklich löschen?</h3>
            <p style={{ margin: 0, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
              Dein Konto, deine gespeicherten Deals und Exporte werden unwiderruflich entfernt.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button type="button" onClick={() => setConfirm(false)} disabled={busy} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', borderRadius: 10, background: '#FFFFFF', border: '1px solid #D6D6D4', font: '500 14px/1 var(--font-dm-sans), Inter, sans-serif', color: '#1C1C1C', cursor: busy ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease' }}>
                Abbrechen
              </button>
              <button type="button" onClick={() => { void doDelete() }} disabled={busy} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', borderRadius: 10, background: '#DC2626', border: 'none', font: '500 14px/1 var(--font-dm-sans), Inter, sans-serif', color: '#FFFFFF', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1, transition: 'all 0.2s ease' }}>
                {busy ? 'Lösche…' : 'Endgültig löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  )
}

const labelStyle: React.CSSProperties = {
  font: '500 11px/1 var(--font-dm-sans), sans-serif',
  letterSpacing: 0.6, textTransform: 'uppercase',
  color: 'rgba(38,37,30,0.5)',
}
const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '11px 12px', borderRadius: 8,
  background: '#ffffff', border: '1px solid #e5e5e5',
  font: '400 14.5px/1.4 var(--font-dm-sans), sans-serif', color: '#26251e',
  outline: 'none',
}
const hintStyle: React.CSSProperties = {
  marginTop: 4, font: '400 12px/1.4 var(--font-dm-sans), sans-serif', color: '#9a9a9a',
}
const primaryBtn = (busy: boolean): React.CSSProperties => ({
  alignSelf: 'flex-start',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '10px 24px', borderRadius: 10,
  background: '#1C1C1C',
  color: '#FFFFFF', border: 'none',
  font: '500 14px/1 var(--font-dm-sans), Inter, sans-serif',
  cursor: busy ? 'not-allowed' : 'pointer',
  opacity: busy ? 0.75 : 1,
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
})
