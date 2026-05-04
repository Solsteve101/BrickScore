'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUsage, nextResetDate, fmtNextResetLong, type UsageState, type UsageHistoryEntry } from '@/lib/usage-store'

const ACTION_ICONS: Record<UsageHistoryEntry['action'], string> = {
  link_analyse: '🔗',
  text_analyse: '📋',
  manual_session: '➕',
  export: '📄',
}

function actionLabel(entry: UsageHistoryEntry): string {
  switch (entry.action) {
    case 'link_analyse': return 'Link-Analyse'
    case 'text_analyse': return 'Text-Analyse'
    case 'manual_session': return 'Neue Session'
    case 'export': {
      const fmt = entry.detail?.split(' · ')[0]
      return fmt ? `${fmt} Export` : 'Export'
    }
  }
}

function actionDetail(entry: UsageHistoryEntry): string {
  if (!entry.detail) return ''
  if (entry.action === 'export') {
    const rest = entry.detail.split(' · ').slice(1).join(' · ')
    return rest || ''
  }
  return entry.detail
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function fmtTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const yest = new Date(now)
    yest.setDate(now.getDate() - 1)
    const time = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    if (isSameDay(d, now)) return `Heute, ${time}`
    if (isSameDay(d, yest)) return `Gestern, ${time}`
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch { return '—' }
}

function resetSubtitle(now: Date = new Date()): string {
  const reset = nextResetDate(now)
  const diffMs = reset.getTime() - now.getTime()
  if (diffMs <= 0) return `Erneuern sich am ${fmtNextResetLong(reset)}`
  const oneDay = 24 * 60 * 60 * 1000
  if (diffMs < oneDay) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000))
    if (hours >= 1) return `Erneuern sich in ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`
    const minutes = Math.max(1, Math.floor(diffMs / (60 * 1000)))
    return `Erneuern sich in ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`
  }
  return `Erneuern sich am ${fmtNextResetLong(reset)}`
}

export default function UsageClient() {
  const [usage, setUsage] = useState<UsageState | null>(null)
  const [, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const u = await getUsage()
      if (!cancelled) setUsage(u)
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  if (!usage) {
    return <div style={{ padding: '36px 40px' }} />
  }

  const used = usage.tokens_max - usage.tokens_remaining
  const ratio = usage.tokens_max > 0 ? used / usage.tokens_max : 0
  const pct = Math.round(ratio * 100)
  const atLimit = usage.tokens_remaining <= 0
  const halfPlus = ratio >= 0.5
  const barColor = '#1C1C1C'

  return (
    <div className="bs-usage-page" style={{ padding: '36px 40px 60px' }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
        <h1 style={{ margin: 0, font: '700 28px/1.2 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
          Nutzung
        </h1>
        <p style={{ margin: 0, font: '400 14.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
          Dein Verbrauch in dieser Woche.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 22 }}>
        <Card
          title="Nutzungslimit"
          subtitle={resetSubtitle()}
          trailing={
            <span style={{ font: '500 12.5px/1 var(--font-jetbrains-mono), monospace', color: '#7a7a7a', fontVariantNumeric: 'tabular-nums' }}>
              {pct}% verbraucht
            </span>
          }
        >
          <span style={{ font: '500 14px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>
            Nutzung diese Woche
          </span>
          <div style={{ marginTop: 12, height: 10, borderRadius: 9999, background: '#f1f0ec', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 9999, transition: 'width 280ms ease' }} />
          </div>
        </Card>

        <Card title="Exporte erstellt" subtitle="PDF, Excel und Screenshots">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ font: '500 32px/1 var(--font-jetbrains-mono), monospace', color: '#0a0a0a', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.6px' }}>
              {usage.exports_count}
            </span>
            <span style={{ font: '500 13px/1 var(--font-dm-sans), sans-serif', color: '#9a9a9a' }}>
              diese Woche
            </span>
          </div>
        </Card>
      </div>

      {atLimit ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
          padding: '14px 18px', borderRadius: 12,
          background: 'rgba(207,45,86,0.08)', border: '1px solid rgba(207,45,86,0.25)',
          marginBottom: 22, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <strong style={{ font: '600 14px/1.3 var(--font-dm-sans), sans-serif', color: '#a01e44' }}>
              Nutzungslimit erreicht.
            </strong>
            <span style={{ font: '400 13px/1.4 var(--font-dm-sans), sans-serif', color: '#a01e44' }}>
              Erneuert sich am Montag.
            </span>
          </div>
          <Link href="/dashboard/subscription" style={upgradeBtn}>Upgrade</Link>
        </div>
      ) : halfPlus ? (
        <div style={{
          padding: '12px 16px', borderRadius: 12, marginBottom: 22,
          background: 'rgba(192,133,50,0.10)', border: '1px solid rgba(192,133,50,0.28)',
          color: '#8b5f22', font: '400 13.5px/1.45 var(--font-dm-sans), sans-serif',
        }}>
          Du hast diese Woche schon einen großen Teil deines Limits genutzt.
        </div>
      ) : null}

      {/* History */}
      <section style={{ marginTop: 8 }}>
        <h3 style={{ margin: 0, font: '600 14.5px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', marginBottom: 10 }}>
          Aktivität
        </h3>
        {usage.history.length === 0 ? (
          <div style={{ padding: '22px 18px', borderRadius: 12, background: '#ffffff', border: '1px dashed #e0e0e0', font: '400 13px/1.5 var(--font-dm-sans), sans-serif', color: '#7a7a7a', textAlign: 'center' }}>
            Noch keine Aktivität diese Woche.
          </div>
        ) : (
          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #ececec', overflow: 'hidden' }}>
            {usage.history.slice(0, 30).map((h, i) => {
              const detail = actionDetail(h)
              return (
                <div
                  key={i}
                  className="bs-usage-row"
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr auto',
                    alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < Math.min(usage.history.length, 30) - 1 ? '1px solid #f4f4f4' : 'none',
                  }}
                >
                  <div className="bs-usage-label" style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span style={{ font: '500 13px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {actionLabel(h)}
                      {detail ? <span style={{ color: '#9a9a9a', fontWeight: 400 }}> — {detail}</span> : null}
                    </span>
                  </div>
                  <span className="bs-usage-time" style={{ font: '400 11.5px/1 var(--font-dm-sans), sans-serif', color: '#9a9a9a', whiteSpace: 'nowrap', minWidth: 110, textAlign: 'right' }}>
                    {fmtTimestamp(h.date)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function Card({ title, subtitle, children, trailing }: { title: string; subtitle: string; children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <div style={{
      padding: '20px 22px', borderRadius: 14,
      background: '#ffffff', border: '1px solid #ececec',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ font: '500 11px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#9a9a9a' }}>
          {title}
        </span>
        {trailing}
      </div>
      {children}
      <span style={{ font: '400 12px/1.4 var(--font-dm-sans), sans-serif', color: '#9a9a9a' }}>
        {subtitle}
      </span>
    </div>
  )
}

const upgradeBtn: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 9,
  background: 'linear-gradient(to bottom, #3d3d3d, #141414)',
  color: '#ffffff', textDecoration: 'none',
  font: '500 13px/1 var(--font-dm-sans), sans-serif',
  border: '1px solid rgba(0,0,0,0.5)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.18)',
  whiteSpace: 'nowrap',
}
