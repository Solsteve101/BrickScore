'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DealCard from './DealCard'
import ExportDealModal, { type ExportFormat } from '@/components/calculator/ExportDealModal'
import ExportsFlyout from './ExportsFlyout'
import { loadDeals, deleteDeal as removeDeal, type SavedDeal } from '@/lib/deals-store'
import { calc, project10yr, dealState, dealScore } from '@/lib/calculator-engine'
import { runExport } from '@/lib/exporters/run-export'
import { countExportsByDeal, deleteExportsForDeal } from '@/lib/exports-store'

type SortKey = 'date' | 'price' | 'score' | 'cashflow'

const SORT_LABELS: Record<SortKey, string> = {
  date: 'Neueste zuerst',
  price: 'Kaufpreis',
  score: 'Deal-Score',
  cashflow: 'Cashflow',
}

export default function DashboardClient() {
  const router = useRouter()
  const [deals, setDeals] = useState<SavedDeal[]>([])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('date')
  const [confirmDelete, setConfirmDelete] = useState<SavedDeal | null>(null)
  const [exportTarget, setExportTarget] = useState<SavedDeal | null>(null)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [exportsViewDeal, setExportsViewDeal] = useState<SavedDeal | null>(null)
  const [exportCounts, setExportCounts] = useState<Record<string, number>>({})

  const refreshCounts = useCallback(async () => {
    setExportCounts(await countExportsByDeal())
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const list = await loadDeals()
      if (!cancelled) setDeals(list)
    })()
    refreshCounts()
    return () => { cancelled = true }
  }, [refreshCounts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = deals
    if (q) {
      list = list.filter((d) => {
        const hay = `${d.titel ?? ''} ${d.inputs.city ?? ''} ${d.inputs.state ?? ''}`.toLowerCase()
        return hay.includes(q)
      })
    }
    const sorted = [...list]
    sorted.sort((a, b) => {
      switch (sort) {
        case 'price': return (Number(b.inputs.price) || 0) - (Number(a.inputs.price) || 0)
        case 'score': return b.kpis.dealScore - a.kpis.dealScore
        case 'cashflow': return b.kpis.monatsCashflow - a.kpis.monatsCashflow
        case 'date':
        default: return new Date(b.datum).getTime() - new Date(a.datum).getTime()
      }
    })
    return sorted
  }, [deals, query, sort])

  const handleOpen = useCallback((d: SavedDeal) => {
    router.push(`/dashboard/new?deal=${encodeURIComponent(d.id)}`)
  }, [router])

  const handleDelete = useCallback((d: SavedDeal) => {
    setConfirmDelete(d)
  }, [])

  const confirmAndDelete = useCallback(async () => {
    if (!confirmDelete) return
    await removeDeal(confirmDelete.id)
    await deleteExportsForDeal(confirmDelete.id)
    setDeals((arr) => arr.filter((d) => d.id !== confirmDelete.id))
    setConfirmDelete(null)
    await refreshCounts()
    showToast('Deal gelöscht')
  }, [confirmDelete, refreshCounts, showToast])

  const runExportForDeal = useCallback(async (deal: SavedDeal, format: ExportFormat) => {
    const r = calc(deal.inputs)
    const rawTerm = parseFloat(deal.inputs.term)
    const termYr = Math.max(1, Math.min(40, Math.round(isFinite(rawTerm) && rawTerm > 0 ? rawTerm : 10)))
    const projection = project10yr(r, termYr + 5)
    const score = dealScore(r)
    const verdict = dealState(r, 5).label

    const res = await runExport({
      format,
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
    refreshCounts()
    return res
  }, [refreshCounts])

  const handleExport = useCallback(async (format: ExportFormat) => {
    if (!exportTarget) return
    setExporting(true)
    try {
      const res = await runExportForDeal(exportTarget, format)
      showToast(res.truncated ? '✓ Heruntergeladen — Datei zu groß zum Speichern' : '✓ Export erstellt')
      setExportTarget(null)
    } catch (e) {
      showToast(`Export fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setExporting(false)
    }
  }, [exportTarget, runExportForDeal, showToast])

  const handleRegenerateFromFlyout = useCallback(async (deal: SavedDeal, format: ExportFormat) => {
    try {
      const res = await runExportForDeal(deal, format)
      showToast(res.truncated ? '✓ Heruntergeladen — Datei zu groß zum Speichern' : '✓ Export erneut erstellt')
    } catch (e) {
      showToast(`Export fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}`)
    }
  }, [runExportForDeal, showToast])

  return (
    <>
      <div style={{ padding: '36px 40px 60px' }}>
        {/* Header */}
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
          <h1 style={{ margin: 0, font: '700 28px/1.2 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
            Meine Deals
          </h1>
          <p style={{ margin: 0, font: '400 14.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
            Alle gespeicherten Immobilien-Analysen im Überblick.
          </p>
        </header>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 12px', borderRadius: 9,
            background: '#ffffff', border: '1px solid #e5e5e5',
            flex: '1 1 320px', minWidth: 240, maxWidth: 480,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Deals durchsuchen…"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                font: '400 13.5px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a',
                padding: 0, minWidth: 0,
              }}
            />
          </div>

          <SortDropdown value={sort} onChange={setSort} />
        </div>

        {/* Content */}
        {deals.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', font: '400 14px/1.5 var(--font-dm-sans), sans-serif', color: '#7a7a7a' }}>
            Keine Deals gefunden für „{query}".
          </div>
        ) : (
          <div style={{
            display: 'grid', gap: 18,
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          }}>
            {filtered.map((d) => (
              <DealCard
                key={d.id}
                deal={d}
                exportCount={exportCounts[d.id] ?? 0}
                onOpen={handleOpen}
                onExport={(deal) => setExportTarget(deal)}
                onDelete={handleDelete}
                onShowExports={(deal) => setExportsViewDeal(deal)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hidden snapshot targets — one per deal, used by PNG export */}
      <div style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none', opacity: 0 }}>
        {deals.map((d) => (
          <SnapshotCard key={d.id} deal={d} />
        ))}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null) }}
          style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{
            width: '100%', maxWidth: 420,
            background: '#ffffff', borderRadius: 12,
            padding: '22px 24px 20px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <h3 style={{ margin: 0, font: '600 17px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>
              Deal löschen?
            </h3>
            <p style={{ margin: 0, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
              „{confirmDelete.titel || 'Unbenannter Deal'}" wird unwiderruflich aus deiner Liste entfernt.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                style={{ padding: '9px 16px', borderRadius: 8, background: 'transparent', border: '1px solid #d8d8d8', font: '500 13px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', cursor: 'pointer' }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={confirmAndDelete}
                style={{ padding: '9px 16px', borderRadius: 8, background: '#cf2d56', border: '1px solid #b32348', font: '500 13px/1 var(--font-dm-sans), sans-serif', color: '#ffffff', cursor: 'pointer' }}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export modal (reused from Calculator) */}
      <ExportDealModal
        open={exportTarget !== null}
        onClose={() => { if (!exporting) setExportTarget(null) }}
        onExport={(f) => { void handleExport(f) }}
        busy={exporting}
      />

      {/* Saved-exports flyout */}
      <ExportsFlyout
        open={exportsViewDeal !== null}
        deal={exportsViewDeal}
        onClose={() => setExportsViewDeal(null)}
        onRegenerate={(deal, format) => { void handleRegenerateFromFlyout(deal, format) }}
      />

      {/* Toast */}
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

function EmptyState() {
  return (
    <div style={{
      padding: '64px 24px',
      borderRadius: 14, background: '#ffffff', border: '1px dashed #e0e0e0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12,
    }}>
      <span style={{ width: 56, height: 56, borderRadius: 14, background: '#f5f5f3', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#7a7a7a' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </span>
      <h3 style={{ margin: 0, font: '600 18px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>
        Noch keine Deals gespeichert
      </h3>
      <p style={{ margin: 0, maxWidth: 380, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#7a7a7a' }}>
        Analysiere dein erstes Inserat und speichere es hier.
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
        Ersten Deal analysieren →
      </Link>
    </div>
  )
}

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 14px', borderRadius: 9,
          background: '#ffffff', border: '1px solid #e5e5e5',
          font: '500 13px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#9a9a9a' }}>Sortieren:</span>
        {SORT_LABELS[value]}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ color: '#9a9a9a', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 150ms ease' }}>
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            minWidth: 200, padding: 4,
            background: '#ffffff', border: '1px solid #ececec', borderRadius: 9,
            boxShadow: '0 12px 28px rgba(0,0,0,0.12)', zIndex: 5,
          }}
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => { onChange(k); setOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 10px', borderRadius: 6, border: 'none',
                background: value === k ? '#f5f5f3' : 'transparent',
                font: `${value === k ? '600' : '500'} 13px/1 var(--font-dm-sans), sans-serif`,
                color: '#0a0a0a', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { if (value !== k) e.currentTarget.style.background = '#fafaf8' }}
              onMouseLeave={(e) => { if (value !== k) e.currentTarget.style.background = 'transparent' }}
            >
              {SORT_LABELS[k]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SnapshotCard({ deal }: { deal: SavedDeal }) {
  const cf = deal.kpis.monatsCashflow
  const cfColor = cf >= 0 ? '#1f8a65' : '#cf2d56'
  return (
    <div
      id={`vestora-deal-snapshot-${deal.id}`}
      style={{
        width: 720, padding: 32, background: '#ffffff', color: '#0a0a0a',
        font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif',
        display: 'flex', flexDirection: 'column', gap: 18,
        border: '1px solid #ececec', borderRadius: 14,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #ececec', paddingBottom: 12 }}>
        <span style={{ font: '500 14px/1 var(--font-dm-sans), sans-serif' }}>brickscore</span>
        <span style={{ color: '#7a7a7a', fontSize: 12 }}>{new Date(deal.datum).toLocaleDateString('de-DE')}</span>
      </div>
      <h2 style={{ margin: 0, font: '600 22px/1.2 var(--font-dm-sans), sans-serif' }}>{deal.titel || 'Immobilien-Analyse'}</h2>
      <div style={{ color: '#6a6a6a' }}>{deal.inputs.city || '—'} · {deal.inputs.state}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Stat k="Kaufpreis" v={`€${(Number(deal.inputs.price) || 0).toLocaleString('de-DE')}`} />
        <Stat k="Monats-Cashflow" v={`${cf >= 0 ? '+' : '−'}€${Math.abs(Math.round(cf)).toLocaleString('de-DE')}`} color={cfColor} />
        <Stat k="Deal-Score" v={`${deal.kpis.dealScore} / 100`} />
        <Stat k="Netto-Rendite" v={`${deal.kpis.nettoRendite.toFixed(1).replace('.', ',')} %`} />
        <Stat k="Cash-on-Cash" v={`${deal.kpis.cashOnCash.toFixed(1).replace('.', ',')} %`} />
        <Stat k="LTV" v={`${deal.kpis.ltv.toFixed(1).replace('.', ',')} %`} />
      </div>
    </div>
  )
}

function Stat({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ font: '500 11px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#9a9a9a' }}>{k}</span>
      <span style={{ font: '500 18px/1 var(--font-jetbrains-mono), monospace', color: color || '#0a0a0a' }}>{v}</span>
    </div>
  )
}
