'use client'

import { useEffect, useState } from 'react'

interface CreditRow {
  id: string
  createdAt: string
  amountEuros: number
  status: 'pending' | 'active' | 'used' | 'expired'
  referredEmail: string
}

interface Stats {
  referralCode: string
  balanceEuros: number
  pendingEuros: number
  totalEarnedEuros: number
  referralsCount: number
  recentCredits: CreditRow[]
}

function fmtEur(n: number): string {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return '—'
  }
}

const STATUS_LABEL: Record<CreditRow['status'], string> = {
  pending: 'Pending',
  active: 'Aktiv',
  used: 'Verrechnet',
  expired: 'Verfallen',
}

const STATUS_STYLE: Record<CreditRow['status'], { bg: string; fg: string }> = {
  pending: { bg: 'rgba(184,150,12,0.10)', fg: '#8a6f0a' },
  active: { bg: 'rgba(31,138,101,0.13)', fg: '#1a6a45' },
  used: { bg: '#f1f0ec', fg: '#6a6a6a' },
  expired: { bg: 'rgba(207,45,86,0.10)', fg: '#a01e44' },
}

export default function ReferralsClient() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('https://brickscore.de')

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/referral/stats', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as Stats
        if (!cancelled) setStats(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const referralUrl = stats?.referralCode ? `${origin}/?ref=${stats.referralCode}` : ''

  const handleCopy = async () => {
    if (!referralUrl) return
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  return (
    <div style={{ padding: '36px 40px 60px' }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
        <h1 style={{ margin: 0, font: '700 28px/1.2 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
          Empfehlungsprogramm
        </h1>
        <p style={{ margin: 0, font: '400 14.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
          Empfehle BrickScore weiter und erhalte 10% jedes Monatsbeitrags als Guthaben.
        </p>
      </header>

      {loading ? (
        <div style={{ padding: 24, color: '#6a6a6a', font: '400 14px/1 var(--font-dm-sans), sans-serif' }}>
          Lade Empfehlungs-Daten ...
        </div>
      ) : stats ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Balance card */}
          <section style={{
            padding: '28px 30px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #1C1C1C 0%, #0a0a0a 100%)',
            color: '#f7f7f4',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <span style={{ font: '500 11.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(247,247,244,0.5)' }}>
              Aktuelles Guthaben
            </span>
            <span style={{ font: '700 44px/1 var(--font-dm-sans), sans-serif', letterSpacing: '-1.2px' }}>
              {fmtEur(stats.balanceEuros)} €
            </span>
            <span style={{ font: '400 13px/1.5 var(--font-dm-sans), sans-serif', color: 'rgba(247,247,244,0.55)' }}>
              Wird automatisch von deiner nächsten Rechnung abgezogen.
            </span>
          </section>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <StatCard label="Geworbene Nutzer" value={String(stats.referralsCount)} />
            <StatCard label="Pending Guthaben" value={`${fmtEur(stats.pendingEuros)} €`} hint="In 30 Tagen verfügbar" />
            <StatCard label="Insgesamt verdient" value={`${fmtEur(stats.totalEarnedEuros)} €`} />
          </div>

          {/* Referral link */}
          <section style={{
            padding: '20px 22px',
            borderRadius: 14,
            background: '#F9F8F6',
            border: '1px solid #E7E5E1',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: '500 11.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#9a9a9a' }}>
                Dein Empfehlungslink
              </span>
              <span style={{ font: '400 12.5px/1.4 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
                Teile diesen Link. Sobald jemand über deinen Link ein Abo abschließt, erhältst du dauerhaft 10% Guthaben.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <input
                readOnly
                value={referralUrl}
                onFocus={(e) => e.currentTarget.select()}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 9,
                  border: '1px solid #d8d8d8', background: '#ffffff',
                  font: '500 13.5px/1 var(--font-dm-sans), monospace',
                  color: '#0a0a0a', minWidth: 0,
                }}
              />
              <button
                type="button"
                onClick={() => void handleCopy()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '11px 16px', borderRadius: 9,
                  background: '#1C1C1C', color: '#FFFFFF', border: 'none',
                  font: '500 13.5px/1 var(--font-dm-sans), sans-serif',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#2C2C2C' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#1C1C1C' }}
              >
                <CopyIcon />
                {copied ? 'Kopiert!' : 'Kopieren'}
              </button>
            </div>
          </section>

          {/* Recent credits */}
          <section style={{
            padding: '20px 22px',
            borderRadius: 14,
            background: '#ffffff',
            border: '1px solid #ececec',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <h2 style={{ margin: 0, font: '600 16px/1.2 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>
              Letzte Gutschriften
            </h2>
            {stats.recentCredits.length === 0 ? (
              <p style={{ margin: 0, padding: '24px 0', textAlign: 'center', font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#9a9a9a' }}>
                Du hast noch keine Empfehlungen. Teile deinen Link, um Guthaben zu verdienen.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 100px 110px',
                  gap: 12, padding: '0 12px 8px',
                  font: '500 11.5px/1 var(--font-dm-sans), sans-serif',
                  letterSpacing: 0.4, textTransform: 'uppercase', color: '#9a9a9a',
                  borderBottom: '1px solid #f1f0ec',
                }}>
                  <span>Datum</span>
                  <span>Geworbener</span>
                  <span style={{ textAlign: 'right' }}>Betrag</span>
                  <span style={{ textAlign: 'right' }}>Status</span>
                </div>
                {stats.recentCredits.map((c) => (
                  <div key={c.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr 100px 110px',
                    gap: 12, padding: '10px 12px',
                    alignItems: 'center',
                    font: '400 13.5px/1.3 var(--font-dm-sans), sans-serif',
                    color: '#3a3a3a',
                    borderRadius: 8,
                  }}>
                    <span style={{ color: '#6a6a6a' }}>{fmtDate(c.createdAt)}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.referredEmail}
                    </span>
                    <span style={{ textAlign: 'right', font: '500 13.5px/1 var(--font-dm-sans), sans-serif' }}>
                      {fmtEur(c.amountEuros)} €
                    </span>
                    <span style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 9999,
                        background: STATUS_STYLE[c.status].bg, color: STATUS_STYLE[c.status].fg,
                        font: '600 10.5px/1.3 var(--font-dm-sans), sans-serif',
                        letterSpacing: 0.3, textTransform: 'uppercase',
                      }}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div style={{ padding: 24, color: '#cf2d56', font: '400 14px/1 var(--font-dm-sans), sans-serif' }}>
          Empfehlungs-Daten konnten nicht geladen werden.
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 12,
      background: '#ffffff', border: '1px solid #ececec',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <span style={{ font: '500 11.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.5, textTransform: 'uppercase', color: '#9a9a9a' }}>
        {label}
      </span>
      <span style={{ font: '600 22px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', letterSpacing: '-0.4px' }}>
        {value}
      </span>
      {hint && (
        <span style={{ font: '400 11.5px/1.3 var(--font-dm-sans), sans-serif', color: '#9a9a9a' }}>
          {hint}
        </span>
      )}
    </div>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}
