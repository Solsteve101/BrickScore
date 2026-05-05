'use client'

import { useState, useEffect } from 'react'

export type ExportFormat = 'pdf' | 'xlsx'

interface ExportDealModalProps {
  open: boolean
  onClose: () => void
  onExport: (format: ExportFormat) => void
  busy?: boolean
}

const OPTIONS: { key: ExportFormat; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    key: 'pdf',
    title: 'PDF Export',
    desc: 'Professionelle Analyse für Banken & Berater',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
        <line x1="8" y1="9" x2="10" y2="9" />
      </svg>
    ),
  },
  {
    key: 'xlsx',
    title: 'Excel Export',
    desc: 'Alle Zahlen als editierbare Tabelle',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
        <line x1="12" y1="11" x2="12" y2="19" />
      </svg>
    ),
  },
]

export default function ExportDealModal({ open, onClose, onExport, busy = false }: ExportDealModalProps) {
  const [picked, setPicked] = useState<ExportFormat>('pdf')

  useEffect(() => {
    if (!open) return
    setPicked('pdf')
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, busy])

  if (!open) return null

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'v-fade-in 160ms ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 620,
        background: '#1C1C1C',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
        color: '#f7f7f4',
        padding: '24px 26px 22px',
        display: 'flex', flexDirection: 'column', gap: 20,
        animation: 'v-pop-in 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h2 style={{ margin: 0, font: '700 20px/1.2 var(--font-dm-sans), sans-serif', color: '#ffffff', letterSpacing: '-0.4px' }}>
              Deal exportieren
            </h2>
            <p style={{ margin: 0, font: '400 13.5px/1.4 var(--font-dm-sans), sans-serif', color: 'rgba(247,247,244,0.55)' }}>
              Wähle das Format für den Export.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Schließen"
            style={{ width: 28, height: 28, padding: 0, border: 'none', background: 'rgba(255,255,255,0.06)', color: 'rgba(247,247,244,0.7)', cursor: busy ? 'default' : 'pointer', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.4 : 1 }}
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {OPTIONS.map((opt) => {
            const active = picked === opt.key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPicked(opt.key)}
                disabled={busy}
                style={{
                  textAlign: 'left',
                  padding: '18px 16px 16px',
                  borderRadius: 12,
                  background: active ? 'rgba(247,247,244,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1.5px solid ${active ? 'rgba(247,247,244,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  color: '#f7f7f4',
                  cursor: busy ? 'default' : 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  transition: 'background 140ms ease, border-color 140ms ease',
                }}
              >
                <span style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(247,247,244,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#f7f7f4' }}>
                  {opt.icon}
                </span>
                <span style={{ font: '600 14.5px/1.2 var(--font-dm-sans), sans-serif', color: '#ffffff' }}>
                  {opt.title}
                </span>
                <span style={{ font: '400 12.5px/1.45 var(--font-dm-sans), sans-serif', color: 'rgba(247,247,244,0.55)' }}>
                  {opt.desc}
                </span>
              </button>
            )
          })}
        </div>

        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              padding: '11px 18px', borderRadius: 9,
              background: 'transparent', color: '#f7f7f4',
              border: '1px solid rgba(255,255,255,0.18)',
              font: '500 13.5px/1 var(--font-dm-sans), sans-serif',
              cursor: busy ? 'default' : 'pointer',
              opacity: busy ? 0.5 : 1,
            }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => onExport(picked)}
            disabled={busy}
            style={{
              padding: '11px 22px', borderRadius: 9,
              background: 'linear-gradient(to bottom, #f7f7f4, #d8d8d4)',
              color: '#0a0a0a',
              border: '1px solid rgba(0,0,0,0.5)',
              font: '500 13.5px/1 var(--font-dm-sans), sans-serif',
              cursor: busy ? 'default' : 'pointer',
              opacity: busy ? 0.7 : 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            {busy ? 'Exportieren…' : 'Exportieren'}
          </button>
        </footer>
      </div>
    </div>
  )
}
