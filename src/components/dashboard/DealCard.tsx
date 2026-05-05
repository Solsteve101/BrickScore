'use client'

import { useState, useRef, useEffect } from 'react'
import type { SavedDeal } from '@/lib/deals-store'
import { STATES, fmtEUR } from '@/lib/calculator-engine'

interface DealCardProps {
  deal: SavedDeal
  exportCount?: number
  onOpen: (deal: SavedDeal) => void
  onEdit: (deal: SavedDeal) => void
  onExport: (deal: SavedDeal) => void
  onDelete: (deal: SavedDeal) => void
  onShowExports: (deal: SavedDeal) => void
}

function bundeslandName(code: string): string {
  return STATES.find((s) => s.code === code)?.name ?? code ?? '—'
}

function scoreTone(score: number): { bg: string; fg: string; label: string } {
  if (score >= 90) return { bg: 'rgba(184,146,26,0.14)', fg: '#8b6914', label: 'Score' }
  if (score >= 70) return { bg: 'rgba(31,138,101,0.14)', fg: '#1a6a45', label: 'Score' }
  if (score >= 40) return { bg: 'rgba(192,133,50,0.16)', fg: '#8b5f22', label: 'Score' }
  return { bg: 'rgba(207,45,86,0.12)', fg: '#cf2d56', label: 'Score' }
}

function fmtDateDe(iso: string): string {
  try { return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return '—' }
}

export default function DealCard({ deal, exportCount = 0, onOpen, onEdit, onExport, onDelete, onShowExports }: DealCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const cf = deal.kpis.monatsCashflow
  const cfColor = cf >= 0 ? '#1f8a65' : '#cf2d56'
  const tone = scoreTone(deal.kpis.dealScore)
  const ort = deal.inputs.city || '—'
  const land = bundeslandName(deal.inputs.state)
  const thumb = deal.bilder?.[0]
  const price = Number(deal.inputs.price) || 0

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#ffffff',
        border: '1px solid #f0f0f0',
        borderRadius: 14,
        boxShadow: hover
          ? '0 6px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      {/* Thumbnail */}
      <div
        onClick={() => onOpen(deal)}
        style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          background: thumb ? `url(${thumb}) center/cover no-repeat` : 'linear-gradient(135deg, #f1f1ee, #e6e6e1)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {!thumb && (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#b0b0a8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12l3-3 3 3 5-5 7 7" />
            <path d="M3 21h18V3H3z" />
          </svg>
        )}
        {/* Score badge top-left */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          padding: '4px 10px', borderRadius: 9999,
          background: tone.bg, color: tone.fg,
          font: '600 11.5px/1 var(--font-dm-sans), sans-serif',
          letterSpacing: 0.1,
          backdropFilter: thumb ? 'blur(4px)' : undefined,
        }}>
          Score: {deal.kpis.dealScore}
        </span>

        {/* 3-dot menu top-right */}
        <div ref={wrapRef} style={{ position: 'absolute', top: 8, right: 8 }}>
          <button
            type="button"
            aria-label="Aktionen"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((s) => !s) }}
            style={{
              width: 28, height: 28, borderRadius: 7,
              border: 'none', background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#3a3a3a',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.7" />
              <circle cx="12" cy="12" r="1.7" />
              <circle cx="19" cy="12" r="1.7" />
            </svg>
          </button>

          {menuOpen && (
            <div
              role="menu"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 160,
                padding: 4, background: '#ffffff', border: '1px solid #ececec', borderRadius: 9,
                boxShadow: '0 12px 28px rgba(0,0,0,0.12)', zIndex: 5,
              }}
            >
              <MenuItem label="Öffnen" onClick={() => { setMenuOpen(false); onOpen(deal) }} />
              <MenuItem label="Beschreibung bearbeiten" onClick={() => { setMenuOpen(false); onEdit(deal) }} />
              <MenuItem label="Exportieren" onClick={() => { setMenuOpen(false); onExport(deal) }} />
              {exportCount > 0 && (
                <MenuItem label={`Exporte anzeigen (${exportCount})`} onClick={() => { setMenuOpen(false); onShowExports(deal) }} />
              )}
              <MenuItem label="Löschen" danger onClick={() => { setMenuOpen(false); onDelete(deal) }} />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        onClick={() => onOpen(deal)}
        style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <h3 style={{ margin: 0, font: '600 15.5px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {deal.titel || 'Unbenannter Deal'}
          </h3>
          <span style={{ font: '400 12.5px/1.3 var(--font-dm-sans), sans-serif', color: '#7a7a7a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ort} · {land}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <span style={{ font: '500 18px/1 var(--font-jetbrains-mono), monospace', color: '#0a0a0a', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px' }}>
            {fmtEUR(price)}
          </span>
          <span style={{ font: '500 13px/1 var(--font-jetbrains-mono), monospace', color: cfColor, fontVariantNumeric: 'tabular-nums' }}>
            {fmtEUR(cf, { sign: true })}/Mon
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 4, borderTop: '1px solid #f4f4f4' }}>
          <span style={{ font: '400 11.5px/1 var(--font-dm-sans), sans-serif', color: '#9a9a9a' }}>
            Gespeichert am {fmtDateDe(deal.datum)}
          </span>
          {exportCount > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onShowExports(deal) }}
              title={`${exportCount} ${exportCount === 1 ? 'Export' : 'Exporte'}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 9999,
                background: '#f5f5f3', border: '1px solid #ececec',
                color: '#4a4a4a', cursor: 'pointer',
                font: '500 11px/1 var(--font-dm-sans), sans-serif',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exportCount}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '8px 10px', borderRadius: 6,
        border: 'none', background: 'transparent',
        font: '500 13px/1 var(--font-dm-sans), sans-serif',
        color: danger ? '#cf2d56' : '#0a0a0a',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? 'rgba(207,45,86,0.06)' : '#f5f5f3' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {label}
    </button>
  )
}
