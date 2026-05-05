'use client'

import { useEffect, useState } from 'react'
import {
  loadExportsForDeal,
  base64ToBlob,
  triggerDownload,
  deleteExport,
  type SavedExport,
  type ExportFormatKey,
} from '@/lib/exports-store'
import type { SavedDeal } from '@/lib/deals-store'
import type { ExportFormat } from '@/components/calculator/ExportDealModal'

interface ExportsFlyoutProps {
  open: boolean
  deal: SavedDeal | null
  onClose: () => void
  onRegenerate: (deal: SavedDeal, format: ExportFormat) => void
}

function formatIcon(format: ExportFormatKey) {
  if (format === 'pdf') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  )
  if (format === 'xlsx') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="19" />
      <line x1="8" y1="15" x2="16" y2="15" />
    </svg>
  )
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function formatLabel(f: ExportFormatKey): string {
  return f === 'pdf' ? 'PDF' : f === 'xlsx' ? 'Excel' : 'PNG'
}

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}

export default function ExportsFlyout({ open, deal, onClose, onRegenerate }: ExportsFlyoutProps) {
  const [exports, setExports] = useState<SavedExport[]>([])

  useEffect(() => {
    if (!open || !deal) return
    let cancelled = false
    void (async () => {
      const list = await loadExportsForDeal(deal.id)
      if (!cancelled) setExports(list)
    })()
    return () => { cancelled = true }
  }, [open, deal])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !deal) return null

  const handleDownload = (e: SavedExport) => {
    if (!e.daten) return
    triggerDownload(base64ToBlob(e.daten), e.dateiname)
  }

  const handleRemove = async (e: SavedExport) => {
    await deleteExport(e.export_id)
    setExports((arr) => arr.filter((x) => x.export_id !== e.export_id))
  }

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 110,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 520,
        background: '#ffffff', borderRadius: 14,
        border: '1px solid #ececec',
        boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
        padding: '22px 24px 20px',
        display: 'flex', flexDirection: 'column', gap: 16,
        maxHeight: '80vh', overflowY: 'auto',
      }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <h3 style={{ margin: 0, font: '600 17px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>
              Gespeicherte Exporte
            </h3>
            <p style={{ margin: 0, font: '400 13px/1.4 var(--font-dm-sans), sans-serif', color: '#7a7a7a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {deal.titel || 'Unbenannter Deal'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            style={{ width: 28, height: 28, padding: 0, border: 'none', background: '#f5f5f3', color: '#4a4a4a', cursor: 'pointer', borderRadius: 7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {exports.length === 0 ? (
          <div style={{
            padding: '36px 16px', borderRadius: 10, background: '#fafafa', border: '1px dashed #e5e5e5',
            textAlign: 'center', font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#7a7a7a',
          }}>
            Noch keine Exporte für diesen Deal.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {exports.map((e) => (
              <div key={e.export_id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 10,
                background: '#ffffff', border: '1px solid #ececec',
              }}>
                <span style={{
                  width: 38, height: 38, flexShrink: 0, borderRadius: 9,
                  background: '#f5f5f3', color: '#4a4a4a',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {formatIcon(e.format)}
                </span>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ font: '500 13.5px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.dateiname}
                  </span>
                  <span style={{ font: '400 11.5px/1 var(--font-dm-sans), sans-serif', color: '#9a9a9a' }}>
                    {formatLabel(e.format)} · {fmtDateTime(e.datum)}
                    {!e.daten && '  ·  Datei nicht zwischengespeichert'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {e.daten ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(e)}
                      style={smallPrimaryBtn}
                    >
                      Herunterladen
                    </button>
                  ) : (e.format === 'pdf' || e.format === 'xlsx') ? (
                    <button
                      type="button"
                      onClick={() => onRegenerate(deal, e.format as 'pdf' | 'xlsx')}
                      style={smallOutlineBtn}
                    >
                      Erneut generieren
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleRemove(e)}
                    aria-label="Eintrag entfernen"
                    style={iconRemoveBtn}
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const smallPrimaryBtn: React.CSSProperties = {
  padding: '7px 12px', borderRadius: 7,
  background: 'linear-gradient(to bottom, #3d3d3d, #141414)',
  color: '#ffffff', border: '1px solid rgba(0,0,0,0.5)',
  font: '500 12px/1 var(--font-dm-sans), sans-serif',
  cursor: 'pointer', whiteSpace: 'nowrap',
}
const smallOutlineBtn: React.CSSProperties = {
  padding: '7px 12px', borderRadius: 7,
  background: '#ffffff', color: '#0a0a0a', border: '1px solid #d8d8d8',
  font: '500 12px/1 var(--font-dm-sans), sans-serif',
  cursor: 'pointer', whiteSpace: 'nowrap',
}
const iconRemoveBtn: React.CSSProperties = {
  width: 26, height: 26, padding: 0, borderRadius: 6,
  border: '1px solid #ececec', background: '#ffffff', color: '#9a9a9a',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}
