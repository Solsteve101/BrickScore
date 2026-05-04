'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  loadExports,
  deleteExport,
  base64ToBlob,
  triggerDownload,
  type SavedExport,
  type ExportFormatKey,
} from '@/lib/exports-store'
import { loadDeals, type SavedDeal } from '@/lib/deals-store'
import { calc, project10yr, dealState, dealScore } from '@/lib/calculator-engine'
import { runExport } from '@/lib/exporters/run-export'

function formatIcon(format: ExportFormatKey) {
  if (format === 'pdf') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  )
  if (format === 'xlsx') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="19" />
      <line x1="8" y1="15" x2="16" y2="15" />
    </svg>
  )
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function formatBadge(format: ExportFormatKey): { label: string; bg: string; fg: string } {
  if (format === 'pdf') return { label: 'PDF', bg: 'rgba(207,45,86,0.10)', fg: '#a01e44' }
  if (format === 'xlsx') return { label: 'Excel', bg: 'rgba(31,138,101,0.13)', fg: '#1a6a45' }
  return { label: 'PNG', bg: 'rgba(60,100,180,0.12)', fg: '#2a4c8a' }
}

function fmtDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return `${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`
  } catch { return '—' }
}

export default function ExportsClient() {
  const [exports, setExports] = useState<SavedExport[]>([])
  const [deals, setDeals] = useState<SavedDeal[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [exp, dl] = await Promise.all([loadExports(), loadDeals()])
      if (cancelled) return
      setExports(exp)
      setDeals(dl)
    })()
    return () => { cancelled = true }
  }, [])

  const dealsById = useMemo(() => {
    const map: Record<string, SavedDeal> = {}
    for (const d of deals) map[d.id] = d
    return map
  }, [deals])

  const sorted = useMemo(() => {
    return [...exports].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
  }, [exports])

  const handleDownload = useCallback((e: SavedExport) => {
    if (!e.daten) return
    triggerDownload(base64ToBlob(e.daten), e.dateiname)
  }, [])

  const handleDelete = useCallback(async (e: SavedExport) => {
    await deleteExport(e.export_id)
    setExports((arr) => arr.filter((x) => x.export_id !== e.export_id))
    showToast('Export gelöscht')
  }, [showToast])

  const handleRegenerate = useCallback(async (e: SavedExport) => {
    const deal = dealsById[e.deal_id]
    if (!deal) {
      showToast('Zugehöriger Deal nicht mehr vorhanden.')
      return
    }
    setBusyId(e.export_id)
    try {
      const r = calc(deal.inputs)
      const rawTerm = parseFloat(deal.inputs.term)
      const termYr = Math.max(1, Math.min(40, Math.round(isFinite(rawTerm) && rawTerm > 0 ? rawTerm : 10)))
      const projection = project10yr(r, termYr + 5)
      const score = dealScore(r)
      const verdict = dealState(r, 5).label

      const res = await runExport({
        format: e.format,
        titel: deal.titel,
        link: deal.link,
        bilder: deal.bilder,
        inputs: deal.inputs,
        result: r,
        projection,
        termYr,
        score,
        verdict,
        pngTargetId: `vestora-deal-snapshot-${deal.id}`,
        dealId: deal.id,
      })
      setExports(await loadExports())
      showToast(res.truncated ? '✓ Heruntergeladen — Datei zu groß zum Speichern' : '✓ Export erneut erstellt')
    } catch (err) {
      showToast(`Export fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBusyId(null)
    }
  }, [dealsById, showToast])

  return (
    <>
      <div className="bs-exports-page" style={{ padding: '36px 40px 60px' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
          <h1 style={{ margin: 0, font: '700 28px/1.2 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
            Meine Exporte
          </h1>
          <p style={{ margin: 0, font: '400 14.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
            Alle exportierten Analysen im Überblick.
          </p>
        </header>

        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sorted.map((e) => {
              const badge = formatBadge(e.format)
              const deal = dealsById[e.deal_id]
              const dealTitle = deal?.titel || (deal ? 'Unbenannter Deal' : 'Deal nicht mehr vorhanden')
              return (
                <div
                  key={e.export_id}
                  className="bs-export-row"
                  style={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr auto',
                    alignItems: 'center',
                    gap: 16,
                    padding: '14px 18px',
                    background: '#ffffff',
                    border: '1px solid #ececec',
                    borderRadius: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <span style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: '#f5f5f3', color: '#4a4a4a',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {formatIcon(e.format)}
                  </span>

                  <div className="bs-export-info" style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="bs-export-filename" style={{ font: '600 14.5px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        {e.dateiname}
                      </span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 9999,
                        background: badge.bg, color: badge.fg,
                        font: '600 10.5px/1.3 var(--font-dm-sans), sans-serif',
                        letterSpacing: 0.3, textTransform: 'uppercase',
                      }}>
                        {badge.label}
                      </span>
                    </div>
                    <span style={{ font: '400 12.5px/1.3 var(--font-dm-sans), sans-serif', color: '#7a7a7a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dealTitle}
                    </span>
                    <span style={{ font: '400 11.5px/1 var(--font-dm-sans), sans-serif', color: '#9a9a9a' }}>
                      {fmtDateTime(e.datum)}
                      {!e.daten && '  ·  Datei nicht zwischengespeichert'}
                    </span>
                  </div>

                  <div className="bs-export-buttons hidden md:flex" style={{ gap: 6, flexShrink: 0 }}>
                    {e.daten && (
                      <button
                        type="button"
                        onClick={() => handleDownload(e)}
                        style={primaryBtn}
                      >
                        Herunterladen
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { void handleRegenerate(e) }}
                      disabled={!deal || busyId === e.export_id}
                      style={{
                        ...outlineBtn,
                        opacity: !deal || busyId === e.export_id ? 0.5 : 1,
                        cursor: !deal || busyId === e.export_id ? 'default' : 'pointer',
                      }}
                    >
                      {busyId === e.export_id ? 'Wird erstellt…' : 'Erneut generieren'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(e)}
                      style={dangerOutlineBtn}
                    >
                      Löschen
                    </button>
                  </div>

                  <ExportMenu
                    canDownload={!!e.daten}
                    onDownload={() => handleDownload(e)}
                    onRegenerate={() => { void handleRegenerate(e) }}
                    onDelete={() => handleDelete(e)}
                    busy={busyId === e.export_id}
                    dealMissing={!deal}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Hidden snapshot targets so PNG re-generation has a DOM node */}
      <div style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none', opacity: 0 }}>
        {deals.map((d) => (
          <div
            key={d.id}
            id={`vestora-deal-snapshot-${d.id}`}
            style={{
              width: 720, padding: 32, background: '#ffffff', color: '#0a0a0a',
              font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif',
              border: '1px solid #ececec', borderRadius: 14,
            }}
          >
            <h2 style={{ margin: 0, font: '600 22px/1.2 var(--font-dm-sans), sans-serif' }}>{d.titel || 'Immobilien-Analyse'}</h2>
            <div style={{ color: '#6a6a6a', marginTop: 6 }}>{d.inputs.city || '—'} · {d.inputs.state}</div>
          </div>
        ))}
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: '#26251e', color: '#f7f7f4', padding: '10px 18px', borderRadius: 9999,
          font: '500 13px var(--font-dm-sans), sans-serif', zIndex: 120,
          boxShadow: '0 14px 32px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}
    </>
  )
}

function ExportMenu({
  canDownload, onDownload, onRegenerate, onDelete, busy, dealMissing,
}: {
  canDownload: boolean
  onDownload: () => void
  onRegenerate: () => void
  onDelete: () => void
  busy: boolean
  dealMissing: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const item: React.CSSProperties = {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '10px 14px', border: 'none', background: 'transparent',
    font: '500 13.5px/1 var(--font-dm-sans), sans-serif',
    color: '#0a0a0a', cursor: 'pointer', borderRadius: 6,
  }

  return (
    <div ref={ref} className="bs-export-menu md:hidden" style={{ position: 'absolute', top: 8, right: 8 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Aktionen"
        aria-expanded={open}
        style={{
          width: 32, height: 32, padding: 0, borderRadius: 8,
          border: '1px solid transparent', background: 'transparent',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#4a4a4a',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f3' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0,
            minWidth: 180, padding: 4,
            background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: 10,
            boxShadow: '0 10px 28px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)',
            zIndex: 30,
          }}
        >
          {canDownload && (
            <button type="button" style={item} onClick={() => { setOpen(false); onDownload() }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f3' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              Herunterladen
            </button>
          )}
          <button
            type="button"
            disabled={dealMissing || busy}
            style={{ ...item, opacity: dealMissing || busy ? 0.5 : 1, cursor: dealMissing || busy ? 'default' : 'pointer' }}
            onClick={() => { if (!dealMissing && !busy) { setOpen(false); onRegenerate() } }}
            onMouseEnter={(e) => { if (!dealMissing && !busy) e.currentTarget.style.background = '#f5f5f3' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            {busy ? 'Wird erstellt…' : 'Erneut generieren'}
          </button>
          <button type="button" style={{ ...item, color: '#cf2d56' }} onClick={() => { setOpen(false); onDelete() }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(207,45,86,0.06)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            Löschen
          </button>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      padding: '64px 24px',
      borderRadius: 14, background: '#ffffff', border: '1px dashed #e0e0e0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12,
    }}>
      <span style={{ width: 56, height: 56, borderRadius: 14, background: '#f5f5f3', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#7a7a7a' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </span>
      <h3 style={{ margin: 0, font: '600 18px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>
        Noch keine Exporte erstellt
      </h3>
      <p style={{ margin: 0, maxWidth: 380, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#7a7a7a' }}>
        Exportiere einen Deal als PDF, Excel oder Screenshot.
      </p>
      <Link
        href="/dashboard/new"
        style={{
          marginTop: 4, padding: '11px 20px', borderRadius: 9,
          background: 'linear-gradient(to bottom, #3d3d3d, #141414)',
          color: '#ffffff', textDecoration: 'none',
          font: '500 13.5px/1 var(--font-dm-sans), sans-serif',
          border: '1px solid rgba(0,0,0,0.5)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.18)',
        }}
      >
        Zum Calculator →
      </Link>
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '8px 16px', borderRadius: 10,
  background: '#1C1C1C',
  color: '#FFFFFF', border: 'none',
  font: '500 14px/1 var(--font-dm-sans), Inter, sans-serif',
  cursor: 'pointer', whiteSpace: 'nowrap',
  transition: 'all 0.2s ease',
}
const outlineBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '8px 16px', borderRadius: 10,
  background: '#FFFFFF', color: '#1C1C1C', border: '1px solid #D6D6D4',
  font: '500 14px/1 var(--font-dm-sans), Inter, sans-serif',
  cursor: 'pointer', whiteSpace: 'nowrap',
  transition: 'all 0.2s ease',
}
const dangerOutlineBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '8px 16px', borderRadius: 10,
  background: '#FFFFFF', color: '#DC2626', border: '1px solid #D6D6D4',
  font: '500 14px/1 var(--font-dm-sans), Inter, sans-serif',
  cursor: 'pointer', whiteSpace: 'nowrap',
  transition: 'all 0.2s ease',
}
