'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  type CalcInputs,
  type CalcResult,
  type ProjectionRow,
  type DealTone,
  type NkOverrides,
  type NkComponents,
  STATES,
  calc,
  project10yr,
  fmtEUR,
  fmtPct,
  fmtCompact,
  dealState,
  dealScore,
  nkComponents,
  nkTotalPct,
} from '@/lib/calculator-engine'
import { CITIES, normCity } from '@/lib/cities-data'
import { useListingAnalysis, type ListingData } from '@/hooks/useListingAnalysis'
import SaveDealModal from './SaveDealModal'
import ExportDealModal, { type ExportFormat } from './ExportDealModal'
import { saveDeal as persistDeal, updateDeal, buildKpis, findDealById, type SavedDeal } from '@/lib/deals-store'
import { runExport } from '@/lib/exporters/run-export'
import { hasTokens, spendTokens } from '@/lib/usage-store'
import { pushToast } from '@/lib/toast'

// ═══════════════════════════════════════════════════════════
// CHART HELPERS
// ═══════════════════════════════════════════════════════════

function buildPath(pts: { x: number; y: number }[]): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
}

function buildArea(pts: { x: number; y: number }[], y0: number): string {
  if (!pts.length) return ''
  const first = pts[0]
  const last = pts[pts.length - 1]
  return (
    `M${first.x.toFixed(2)},${y0.toFixed(2)} ` +
    pts.map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') +
    ` L${last.x.toFixed(2)},${y0.toFixed(2)} Z`
  )
}

// ═══════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════

function VIcon({ name, size = 16, stroke = 1.5 }: { name: string; size?: number; stroke?: number }) {
  const paths: Record<string, React.ReactNode> = {
    bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </>
    ),
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function InfoTip({ content, size = 11 }: { content: string; size?: number }) {
  const [shown, setShown] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!shown) return
    const onDoc = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return
      if (popRef.current?.contains(e.target as Node)) return
      setShown(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [shown])

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShown((s) => !s) }}
        aria-label="Definition anzeigen"
        style={{
          width: size, height: size, padding: 0,
          border: 'none', cursor: 'pointer', background: 'transparent',
          color: shown ? 'rgba(38,37,30,0.75)' : 'rgba(38,37,30,0.32)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'color 140ms ease',
        }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </button>
      {shown && (
        <span
          ref={popRef}
          role="tooltip"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: -4,
            zIndex: 50, width: 240, maxWidth: 'calc(100vw - 40px)',
            padding: '10px 12px', borderRadius: 8,
            background: '#26251e', color: '#f2f1ed',
            boxShadow: '0 14px 36px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.2)',
            font: '400 12px/1.45 var(--font-dm-sans), sans-serif',
            letterSpacing: 0.05, textAlign: 'left', pointerEvents: 'auto',
          }}
        >
          <span style={{ position: 'absolute', top: -4, left: 8, width: 8, height: 8, background: '#26251e', transform: 'rotate(45deg)' }} />
          {content}
        </span>
      )}
    </span>
  )
}

type ExtTone = DealTone | 'elite'

function Pill({ tone = 'neutral', children, dot = false }: { tone?: ExtTone; children: React.ReactNode; dot?: boolean }) {
  const tones: Record<ExtTone, { bg: string; fg: string; dot: string }> = {
    neutral: { bg: '#ebebeb', fg: 'rgba(38,37,30,0.7)', dot: 'rgba(38,37,30,0.4)' },
    good:    { bg: 'rgba(31,138,101,0.13)', fg: '#1a6a45', dot: '#1f8a65' },
    elite:   { bg: 'rgba(184,146,26,0.13)', fg: '#8b6914', dot: '#b8921a' },
    warn:    { bg: 'rgba(192,133,50,0.16)', fg: '#8b5f22', dot: '#c08532' },
    bad:     { bg: 'rgba(207,45,86,0.12)', fg: '#cf2d56', dot: '#cf2d56' },
  }
  const t = tones[tone]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 11px', borderRadius: 9999,
      background: t.bg, color: t.fg,
      font: '500 13px/1 var(--font-dm-sans), sans-serif',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />}
      {children}
    </span>
  )
}

function fmtNum(v: string | number | null | undefined): string {
  if (v === '' || v === null || v === undefined) return ''
  const s = String(v).replace(/[^\d.-]/g, '')
  if (s === '' || s === '-' || s === '.') return s
  const [intPart, decPart] = s.split('.')
  const intFormatted = Number(intPart).toLocaleString('de-DE')
  return decPart !== undefined ? `${intFormatted},${decPart}` : intFormatted
}

function NumberInput({
  label, value, onChange, prefix, suffix, hint, placeholder, info, raw,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
  hint?: string
  placeholder?: string
  info?: string
  raw?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const displayValue = focused || raw ? String(value ?? '') : fmtNum(value)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', minWidth: 0 }}>
      {label && (
        <label style={{
          font: '500 10.5px/1.27 var(--font-dm-sans), sans-serif',
          letterSpacing: 0.6, textTransform: 'uppercase',
          color: 'rgba(38,37,30,0.5)',
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <span>{label}</span>
          {info && <InfoTip content={info} />}
        </label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '11px 12px', borderRadius: 8,
        background: '#ffffff',
        border: `1px solid ${focused ? '#0a0a0a' : '#e5e5e5'}`,
        transition: 'border-color 150ms ease',
        width: '100%', minWidth: 0,
      }}>
        {prefix && (
          <span style={{ color: 'rgba(38,37,30,0.5)', fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace', fontSize: 14 }}>
            {prefix}
          </span>
        )}
        <input
          value={displayValue}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const raw = e.target.value.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.-]/g, '')
            onChange(raw)
          }}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
            fontWeight: 500, fontSize: 14.5, color: '#26251e',
            fontVariantNumeric: 'tabular-nums', width: '100%', minWidth: 0,
          }}
        />
        {suffix && (
          <span style={{ color: 'rgba(38,37,30,0.5)', fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace', fontSize: 14 }}>
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <span style={{ font: '400 11.5px/1.35 var(--font-dm-sans), sans-serif', color: 'rgba(38,37,30,0.45)' }}>
          {hint}
        </span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// CITY INPUT
// ═══════════════════════════════════════════════════════════

function CityInput({ value, stateCode, onPick }: {
  value: string
  stateCode: string
  onPick: (city: string, stateCode: string, isTyping?: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [focus, setFocus] = useState(false)
  const [active, setActive] = useState(0)
  const wrap = useRef<HTMLDivElement>(null)

  const stateName = STATES.find((s) => s.code === stateCode)?.name || '—'
  const q = normCity(value)

  const matches = useMemo(() => {
    if (!q) return CITIES
    const starts: typeof CITIES = []
    const contains: typeof CITIES = []
    for (const c of CITIES) {
      const n = normCity(c.city)
      if (n.startsWith(q)) starts.push(c)
      else if (n.includes(q)) contains.push(c)
    }
    return [...starts, ...contains]
  }, [q])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const pick = (m: { city: string; state: string }) => {
    onPick(m.city, m.state)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(matches.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (matches[active]) pick(matches[active]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={wrap} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '11px 12px', borderRadius: 8,
        background: '#ffffff',
        border: `1px solid ${focus ? '#0a0a0a' : '#e5e5e5'}`,
        transition: 'border-color 150ms ease',
      }}>
        <span style={{ color: 'rgba(38,37,30,0.5)', display: 'inline-flex' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <input
          value={value}
          placeholder="Stadt eingeben …"
          onFocus={() => { setFocus(true); setOpen(true); setActive(0) }}
          onBlur={() => setFocus(false)}
          onChange={(e) => { onPick(e.target.value, stateCode, true); setOpen(true); setActive(0) }}
          onKeyDown={onKeyDown}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
            fontWeight: 500, fontSize: 14.5, color: '#26251e',
            width: '100%', minWidth: 0,
          }}
        />
        {stateName && (
          <span style={{
            fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
            fontWeight: 500, fontSize: 10.5, letterSpacing: 0.2,
            color: 'rgba(38,37,30,0.5)',
            whiteSpace: 'nowrap', paddingLeft: 8,
            borderLeft: '1px solid rgba(38,37,30,0.12)',
          }}>{stateName}</span>
        )}
      </div>

      {open && matches.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#ffffff', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.07), 0 0 0 1px #e5e5e5',
          zIndex: 30, padding: 4, maxHeight: 420, overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}>
          {matches.map((m, i) => {
            const stName = STATES.find((s) => s.code === m.state)?.name || m.state
            const isActive = i === active
            return (
              <div
                key={`${m.city}-${m.state}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => { e.preventDefault(); pick(m) }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  padding: '9px 10px', borderRadius: 6, cursor: 'pointer',
                  background: isActive ? 'rgba(38,37,30,0.06)' : 'transparent',
                  transition: 'background 120ms ease',
                }}
              >
                <span style={{ font: '500 13.5px var(--font-dm-sans), sans-serif', color: '#26251e' }}>{m.city}</span>
                <span style={{ font: '400 11px var(--font-jetbrains-mono), monospace', color: 'rgba(38,37,30,0.5)' }}>{stName}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// NEBENKOSTEN EDITOR
// ═══════════════════════════════════════════════════════════

const NK_ROWS: { key: keyof NkComponents; label: string; sub: string }[] = [
  { key: 'grest',     label: 'Grunderwerbsteuer', sub: 'nach Bundesland' },
  { key: 'notar',     label: 'Notar',             sub: 'ca. 1,5 %' },
  { key: 'grundbuch', label: 'Grundbuch',         sub: 'ca. 0,5 %' },
  { key: 'makler',    label: 'Makler',            sub: 'ca. 3,57 % (inkl. MwSt.)' },
]

function NkPctField({ value, onChange, disabled }: { value: number; onChange: (v: string) => void; disabled?: boolean }) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const display = focused
    ? (draft ?? String(value ?? ''))
    : String(value ?? '').replace('.', ',')

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '5px 8px', borderRadius: 6,
      background: disabled ? 'rgba(38,37,30,0.03)' : '#ffffff',
      border: `1px solid ${focused ? '#0a0a0a' : '#e5e5e5'}`,
      opacity: disabled ? 0.5 : 1,
      transition: 'border-color 150ms ease, opacity 150ms ease',
      width: 70,
    }}>
      <input
        value={display}
        disabled={disabled}
        onFocus={(e) => { setFocused(true); setDraft(String(value ?? '')); e.target.select() }}
        onBlur={() => { setFocused(false); setDraft(null) }}
        onChange={(e) => {
          const raw = e.target.value.replace(',', '.').replace(/[^\d.]/g, '')
          setDraft(raw)
          onChange(raw)
        }}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontWeight: 500, fontSize: 12.5, color: '#26251e',
          fontVariantNumeric: 'tabular-nums', width: '100%', minWidth: 0,
          textAlign: 'right',
        }}
      />
      <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 11, color: 'rgba(38,37,30,0.5)' }}>%</span>
    </div>
  )
}

function NebenkostenEditor({ state, includeMakler, onToggleMakler, overrides, onOverride, onReset, price }: {
  state: string
  includeMakler: boolean
  onToggleMakler: () => void
  overrides: NkOverrides
  onOverride: (key: keyof NkComponents, val: number) => void
  onReset: () => void
  price: number
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const comps = nkComponents(state, true, overrides)
  const makler = includeMakler ? comps.makler : 0
  const totalPct = comps.grest + comps.notar + comps.grundbuch + makler
  const totalEur = price * totalPct / 100
  const hasOverride = overrides && Object.keys(overrides).length > 0

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 8, background: '#ffffff', border: '1px solid #e5e5e5' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 12px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left', width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: 500,
            fontSize: 14.5, color: '#26251e', fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3,
          }}>
            {fmtEUR(totalEur)}
            <span style={{ marginLeft: 8, fontSize: 12, color: 'rgba(38,37,30,0.5)', fontWeight: 400 }}>
              {totalPct.toFixed(1).replace('.', ',')} %
            </span>
          </span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '500 11.5px/1 var(--font-dm-sans), sans-serif', color: 'rgba(38,37,30,0.55)' }}>
          {open ? 'Weniger' : 'Mehr'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 40,
          padding: '10px 14px 12px',
          background: '#ffffff', borderRadius: 8,
          border: '1px solid #e5e5e5',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 4 }}>
            {hasOverride ? (
              <button
                onClick={(e) => { e.stopPropagation(); onReset() }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(38,37,30,0.5)', font: '500 10.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.4, textTransform: 'uppercase' }}
              >
                Zurücksetzen
              </button>
            ) : <span />}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false) }}
              aria-label="Schließen"
              style={{ width: 22, height: 22, padding: 0, border: 'none', background: 'transparent', color: 'rgba(38,37,30,0.45)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {NK_ROWS.map((row, i) => {
            const isMakler = row.key === 'makler'
            const dim = isMakler && !includeMakler
            const pct = comps[row.key]
            const eur = isMakler && !includeMakler ? 0 : price * pct / 100
            return (
              <div key={row.key} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto',
                columnGap: 10, alignItems: 'center',
                padding: '9px 0',
                borderBottom: i < NK_ROWS.length - 1 ? '1px solid rgba(38,37,30,0.05)' : 'none',
                opacity: dim ? 0.45 : 1, transition: 'opacity 150ms ease',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                  <span style={{ font: '500 12.5px/1.25 var(--font-dm-sans), sans-serif', color: '#26251e' }}>{row.label}</span>
                  <span style={{ font: '400 10.5px/1.2 var(--font-dm-sans), sans-serif', color: 'rgba(38,37,30,0.45)' }}>
                    {row.key === 'grest' && !state ? 'nach Bundesland · frei eintragen' : row.sub}
                  </span>
                </div>

                <NkPctField
                  value={pct}
                  disabled={dim}
                  onChange={(v) => {
                    if (v === '' || v === '.' || v === undefined) { onOverride(row.key, 0); return }
                    const n = parseFloat(v)
                    onOverride(row.key, isNaN(n) ? 0 : n)
                  }}
                />

                {isMakler ? (
                  <button
                    onClick={onToggleMakler}
                    aria-label="Makler einrechnen"
                    style={{
                      width: 28, height: 16, borderRadius: 9999,
                      background: includeMakler ? '#26251e' : 'rgba(38,37,30,0.18)',
                      border: 'none', cursor: 'pointer', position: 'relative',
                      transition: 'background 150ms ease', marginLeft: 4,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 2, left: includeMakler ? 14 : 2,
                      width: 12, height: 12, borderRadius: '50%', background: '#f7f7f4',
                      transition: 'left 150ms ease',
                    }} />
                  </button>
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: 500, fontSize: 12.5,
                    color: 'rgba(38,37,30,0.65)', fontVariantNumeric: 'tabular-nums',
                    textAlign: 'right', minWidth: 68,
                  }}>
                    {fmtEUR(eur)}
                  </span>
                )}
              </div>
            )
          })}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', columnGap: 10, alignItems: 'baseline', paddingTop: 10, marginTop: 4, borderTop: '1px solid rgba(38,37,30,0.15)' }}>
            <span style={{ font: '500 10.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#26251e' }}>Summe</span>
            <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: 600, fontSize: 13, color: '#26251e', fontVariantNumeric: 'tabular-nums', textAlign: 'right', paddingRight: 22 }}>
              {totalPct.toFixed(2).replace('.', ',')} %
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: 600, fontSize: 13, color: '#26251e', fontVariantNumeric: 'tabular-nums', textAlign: 'right', minWidth: 68, paddingBottom: 8 }}>
              {fmtEUR(totalEur)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LISTING IMPORT
// ═══════════════════════════════════════════════════════════

function detectSource(url: string): { key: string; label: string; color: string; bg: string } | null {
  if (!url) return null
  const u = url.toLowerCase()
  if (u.includes('immobilienscout24') || u.includes('is24'))
    return { key: 'is24', label: 'ImmoScout24', color: '#b04500', bg: 'rgba(229,102,0,0.12)' }
  if (u.includes('immowelt'))
    return { key: 'iw', label: 'Immowelt', color: '#1a6c4e', bg: 'rgba(31,138,101,0.14)' }
  if (u.includes('kleinanzeigen') || u.includes('ebay-kleinanzeigen') || u.includes('ebay.de'))
    return { key: 'ka', label: 'Kleinanzeigen', color: '#2a4c8a', bg: 'rgba(60,100,180,0.12)' }
  if (u.includes('engelvoelkers') || u.includes('engel-voelkers'))
    return { key: 'ev', label: 'Engel & Völkers', color: '#6a4a12', bg: 'rgba(170,130,50,0.14)' }
  if (u.includes('mcmakler'))
    return { key: 'mc', label: 'McMakler', color: '#2a2a2a', bg: 'rgba(38,37,30,0.08)' }
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (host) return { key: 'other', label: host, color: 'rgba(38,37,30,0.7)', bg: 'rgba(38,37,30,0.06)' }
  } catch { /* ignore */ }
  return null
}

function ListingImport({ url, onUrlChange, onFill }: {
  url: string
  onUrlChange: (url: string) => void
  onFill: (data: ListingData) => void
}) {
  const { status, data, error, analyzeListing, analyzeText, reset } = useListingAnalysis()
  const [fallbackText, setFallbackText] = useState('')
  const [loadingText, setLoadingText] = useState('Analysiere Inserat…')
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (status === 'loading') {
      setLoadingText('Analysiere Inserat…')
      loadingTimerRef.current = setTimeout(() => setLoadingText('Daten werden extrahiert…'), 3000)
    } else {
      if (loadingTimerRef.current !== null) {
        clearTimeout(loadingTimerRef.current)
        loadingTimerRef.current = null
      }
    }
    return () => {
      if (loadingTimerRef.current !== null) clearTimeout(loadingTimerRef.current)
    }
  }, [status])

  const source = useMemo(() => detectSource(url), [url])
  const isValidUrl = url.trim().length > 6 && /^https?:\/\//i.test(url.trim())

  const handleAnalyze = async () => {
    if (!isValidUrl || status === 'loading') return
    const result = await analyzeListing(url)
    if (result) onFill(result)
  }

  const handleFallbackAnalyze = async () => {
    if (!fallbackText.trim() || status === 'loading') return
    const result = await analyzeText(fallbackText)
    if (result) onFill(result)
  }

  const handleClear = () => {
    onUrlChange('')
    reset()
    setFallbackText('')
  }

  const handleUrlChange = (val: string) => {
    onUrlChange(val)
    if (status !== 'idle') reset()
  }

  const ringColor =
    status === 'success' ? 'rgba(31,138,101,0.45)' :
    status === 'error'   ? 'rgba(207,45,86,0.35)'  :
    url                  ? 'rgba(38,37,30,0.18)'   : 'rgba(38,37,30,0.1)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ font: '500 10.5px/1.27 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#26251e' }}>
          Inserat
        </span>
        {source && (
          <span style={{ font: '500 10px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.4, textTransform: 'uppercase', color: source.color, background: source.bg, padding: '4px 7px', borderRadius: 4 }}>
            {source.label}
          </span>
        )}
      </div>

      {/* URL input row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 10px 9px 11px', borderRadius: 10, background: '#fff',
        boxShadow: `0 0 0 1px ${ringColor}`,
        transition: 'box-shadow 240ms ease',
      }}>
        <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 6, background: source ? source.bg : 'rgba(38,37,30,0.06)', color: source ? source.color : 'rgba(38,37,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 200ms ease, color 200ms ease' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6.5 9.5a2.5 2.5 0 0 0 3.54 0l2-2a2.5 2.5 0 0 0-3.54-3.54l-.7.7M9.5 6.5a2.5 2.5 0 0 0-3.54 0l-2 2a2.5 2.5 0 0 0 3.54 3.54l.7-.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <input
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleAnalyze() } }}
          placeholder="Inserats-Link einfügen…"
          spellCheck={false}
          style={{ border: 'none', outline: 'none', background: 'transparent', padding: 0, margin: 0, flex: 1, minWidth: 0, font: '400 13px/1.35 var(--font-dm-sans), sans-serif', color: '#26251e', textOverflow: 'ellipsis' }}
        />

        {/* Right-side indicators */}
        {status === 'loading' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, color: 'rgba(38,37,30,0.55)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ animation: 'vestora-spin 0.9s linear infinite', flexShrink: 0 }}>
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ font: '400 11px/1 var(--font-dm-sans), sans-serif', whiteSpace: 'nowrap' }}>{loadingText}</span>
          </span>
        )}
        {status === 'success' && (
          <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#1f8a65' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        {status === 'idle' && isValidUrl && (
          <button
            onClick={() => { void handleAnalyze() }}
            style={{ flexShrink: 0, border: 'none', background: '#26251e', color: '#f7f7f4', cursor: 'pointer', borderRadius: 6, padding: '5px 9px', font: '500 11px/1 var(--font-dm-sans), sans-serif', whiteSpace: 'nowrap' }}
          >
            Analysieren
          </button>
        )}
        {status === 'error' && isValidUrl && (
          <button
            onClick={() => { void handleAnalyze() }}
            style={{ flexShrink: 0, border: 'none', background: 'rgba(207,45,86,0.1)', color: '#cf2d56', cursor: 'pointer', borderRadius: 6, padding: '5px 9px', font: '500 11px/1 var(--font-dm-sans), sans-serif', whiteSpace: 'nowrap' }}
          >
            Erneut
          </button>
        )}
        {url && status !== 'loading' && (
          <button
            onClick={handleClear}
            title="Link entfernen"
            style={{ flexShrink: 0, border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, color: 'rgba(38,37,30,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Status feedback below input */}
      {status === 'idle' && (
        <p style={{ margin: 0, font: '400 11px/1.4 var(--font-dm-sans), sans-serif', color: 'rgba(38,37,30,0.45)' }}>
          ImmoScout24, Immowelt, Kleinanzeigen &amp; mehr. Bei manchen Portalen ist ein manueller Text-Import nötig.
        </p>
      )}

      {status === 'loading' && (
        <p style={{ margin: 0, font: '400 11px/1.4 var(--font-dm-sans), sans-serif', color: 'rgba(38,37,30,0.55)' }}>
          {loadingText}
        </p>
      )}

      {status === 'success' && data && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 7, background: 'rgba(31,138,101,0.08)', border: '1px solid rgba(31,138,101,0.18)' }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: '#1f8a65' }}>
            <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ font: '400 11.5px/1.35 var(--font-dm-sans), sans-serif', color: '#1a6a45' }}>
            {[
              data.objektart ? (data.ort ? `${data.objektart} in ${data.ort}` : data.objektart) : (data.ort ? `Objekt in ${data.ort}` : 'Objekt'),
              data.kaufpreis != null ? fmtEUR(data.kaufpreis) : null,
              data.wohnflaeche != null ? `${data.wohnflaeche} m²` : null,
              data.zimmer != null ? `${data.zimmer} Zimmer` : null,
            ].filter(Boolean).join(' — ')}
          </span>
        </div>
      )}

      {status === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {error && (
            <p style={{ margin: 0, font: '400 11.5px/1.4 var(--font-dm-sans), sans-serif', color: '#cf2d56' }}>
              {error}
            </p>
          )}
          <p style={{ margin: 0, font: '400 11.5px/1.4 var(--font-dm-sans), sans-serif', color: 'rgba(38,37,30,0.7)' }}>
            Inseratstext manuell einfügen:
          </p>
          <textarea
            value={fallbackText}
            onChange={(e) => setFallbackText(e.target.value)}
            placeholder="Inseratstext hier einfügen…"
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box', borderRadius: 8,
              border: '1px solid #e5e5e5', background: '#fff',
              padding: '9px 10px', font: '400 12px/1.5 var(--font-dm-sans), sans-serif',
              color: '#26251e', resize: 'vertical', outline: 'none',
              transition: 'border-color 150ms ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#0a0a0a' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e5e5' }}
          />
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2, font: '400 10.5px/1.45 var(--font-dm-sans), sans-serif', color: 'rgba(38,37,30,0.45)' }}>
            <li>1. Öffne das Inserat im Browser</li>
            <li>2. Alles markieren (Strg+A) und kopieren (Strg+C)</li>
            <li>3. Hier einfügen (Strg+V)</li>
          </ol>
          <button
            onClick={() => { void handleFallbackAnalyze() }}
            disabled={!fallbackText.trim()}
            style={{
              alignSelf: 'flex-start', border: 'none', background: '#26251e', color: '#f7f7f4',
              cursor: fallbackText.trim() ? 'pointer' : 'default',
              borderRadius: 7, padding: '8px 14px',
              font: '500 12px/1 var(--font-dm-sans), sans-serif',
              opacity: fallbackText.trim() ? 1 : 0.4,
              transition: 'opacity 150ms ease',
            }}
          >
            Inserat analysieren
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// CHARTS
// ═══════════════════════════════════════════════════════════

function CashflowChart({ rows, termYear }: { rows: ProjectionRow[]; termYear: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 640, H = 160
  const padL = 44, padR = 16, padT = 22, padB = 30
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const data = [{ year: 0, yearCf: 0 }, ...rows]
  const values = data.map((r) => r.yearCf)
  const vMax = Math.max(0, ...values)
  const vMin = Math.min(0, ...values)
  const span = (vMax - vMin) || 1
  const years = rows.length

  const xOf = (y: number) => padL + (y / years) * plotW
  const yOf = (v: number) => padT + ((vMax - v) / span) * plotH

  const linePts = data.map((d) => ({ x: xOf(d.year), y: yOf(d.yearCf) }))
  const linePath = linePts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = linePath + ` L${linePts[linePts.length - 1].x.toFixed(1)},${yOf(0).toFixed(1)} L${linePts[0].x.toFixed(1)},${yOf(0).toFixed(1)} Z`

  const avgCf = rows.reduce((a, r) => a + r.yearCf, 0) / Math.max(1, rows.length)
  const lineColor = avgCf >= 0 ? '#1C1C1C' : '#DC2626'
  const areaColor = avgCf >= 0 ? '#E5E7EB' : '#FEE2E2'

  const tickCount = 4
  const ticks: number[] = []
  for (let i = 0; i <= tickCount; i++) ticks.push(vMin + (span * i) / tickCount)

  const xTickEvery = years <= 12 ? 1 : years <= 20 ? 2 : years <= 30 ? 3 : 5
  const termX = termYear != null ? xOf(Math.min(termYear, years)) : null

  return (
    <div className="bs-calc-chart-wrap" style={{ position: 'relative' }}>
      <svg className="bs-calc-chart" viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yOf(t)} y2={yOf(t)} stroke="rgba(38,37,30,0.07)" strokeDasharray={t === 0 ? '' : '2 3'} />
            <text x={padL - 8} y={yOf(t) + 3} textAnchor="end" style={{ font: '500 10px var(--font-jetbrains-mono), monospace', fill: 'rgba(38,37,30,0.45)', fontVariantNumeric: 'tabular-nums' }}>
              {fmtCompact(t)}
            </text>
          </g>
        ))}
        <line x1={padL} x2={W - padR} y1={yOf(0)} y2={yOf(0)} stroke="rgba(38,37,30,0.35)" />

        {termX != null && termYear < years && (
          <g>
            <line x1={termX} x2={termX} y1={padT} y2={H - padB} stroke="rgba(38,37,30,0.45)" strokeDasharray="4 4" strokeWidth="1" />
            <text x={termX} y={padT - 4} textAnchor="middle" style={{ font: '500 10px var(--font-dm-sans), sans-serif', fill: 'rgba(38,37,30,0.4)', letterSpacing: 0.7, textTransform: 'uppercase' }}>
              Laufzeitende
            </text>
          </g>
        )}

        <path d={areaPath} fill={areaColor} opacity="0.7" />
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />

        {rows.map((row, i) => {
          const step = plotW / years
          const cx = xOf(i + 1)
          const showLabel = (i + 1) % xTickEvery === 0 || i + 1 === years
          return (
            <g key={i}>
              <rect x={cx - step / 2} y={padT} width={step} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
              {showLabel && (
                <text x={cx} y={H - padB + 16} textAnchor="middle" style={{ font: '500 10px var(--font-jetbrains-mono), monospace', fill: 'rgba(38,37,30,0.5)' }}>
                  J{row.year}
                </text>
              )}
            </g>
          )
        })}

        {hover !== null && (() => {
          const row = rows[hover]
          const cx = xOf(hover + 1)
          const pos = row.yearCf >= 0
          const cy = yOf(row.yearCf)
          const boxW = 124, boxH = 44
          let bx = cx - boxW / 2
          if (bx < padL) bx = padL
          if (bx + boxW > W - padR) bx = W - padR - boxW
          const by = Math.max(padT, cy - boxH - 10)
          const afterTerm = termYear != null && row.year > termYear
          return (
            <g style={{ pointerEvents: 'none' }}>
              <line x1={cx} x2={cx} y1={padT} y2={H - padB} stroke="rgba(38,37,30,0.25)" strokeDasharray="2 2" />
              <circle cx={cx} cy={cy} r="5" fill={pos ? '#1C1C1C' : '#DC2626'} stroke="#f7f7f4" strokeWidth="2" />
              <rect x={bx} y={by} width={boxW} height={boxH} rx={6} fill="#26251e" />
              <text x={bx + 10} y={by + 17} style={{ font: '500 10px var(--font-dm-sans)', fill: 'rgba(242,241,237,0.6)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Jahr {row.year}{afterTerm ? ' · Projektion' : ''}
              </text>
              <text x={bx + 10} y={by + 34} style={{ font: '500 13px var(--font-jetbrains-mono), monospace', fill: pos ? '#d0d0d0' : '#f5a5b7', fontVariantNumeric: 'tabular-nums' }}>
                {fmtEUR(row.yearCf, { sign: true })}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}

function AmortChart({ rows, loan, equity, termYear }: { rows: ProjectionRow[]; loan: number; equity: number; termYear: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 640, H = 160
  const padL = 44, padR = 16, padT = 22, padB = 30
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const years = rows.length

  const data = [{ year: 0, balance: loan, tilgungSum: 0 }, ...rows]
  const vMax = loan
  const xOf = (y: number) => padL + (y / years) * plotW
  const yOf = (v: number) => padT + (1 - (v - 0) / (vMax - 0 || 1)) * plotH

  const balancePts = data.map((d) => ({ x: xOf(d.year), y: yOf(d.balance) }))
  const tilgungPts = data.map((d) => ({ x: xOf(d.year), y: yOf(d.tilgungSum) }))

  const tickCount = 4
  const ticks: number[] = []
  for (let i = 0; i <= tickCount; i++) ticks.push((vMax * i) / tickCount)

  return (
    <div className="bs-calc-chart-wrap" style={{ position: 'relative' }}>
      <svg className="bs-calc-chart" viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} onMouseLeave={() => setHover(null)}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yOf(t)} y2={yOf(t)} stroke="rgba(38,37,30,0.07)" strokeDasharray="2 3" />
            <text x={padL - 8} y={yOf(t) + 3} textAnchor="end" style={{ font: '500 10px var(--font-jetbrains-mono), monospace', fill: 'rgba(38,37,30,0.45)' }}>
              {fmtCompact(t)}
            </text>
          </g>
        ))}

        <path d={buildArea(balancePts, yOf(0))} fill="#E5E7EB" opacity="0.9" />
        <path d={buildPath(balancePts)} stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
        <path d={buildArea(tilgungPts, yOf(0))} fill="#1C1C1C" opacity="0.18" />
        <path d={buildPath(tilgungPts)} stroke="#1C1C1C" strokeWidth="1.5" fill="none" />

        {termYear != null && termYear < years && (() => {
          const tx = xOf(termYear)
          return (
            <g>
              <line x1={tx} x2={tx} y1={padT} y2={H - padB} stroke="rgba(38,37,30,0.5)" strokeDasharray="4 4" strokeWidth="1" />
              <rect x={tx} y={padT} width={W - padR - tx} height={plotH} fill="rgba(38,37,30,0.035)" />
              <text x={W - padR} y={padT - 4} textAnchor="end" style={{ font: '500 10px var(--font-dm-sans), sans-serif', fill: 'rgba(38,37,30,0.4)', letterSpacing: 0.7, textTransform: 'uppercase' }}>
                Laufzeitende · Projektion
              </text>
            </g>
          )
        })()}

        {equity > 0 && equity <= vMax && (
          <g>
            <line x1={padL} x2={W - padR} y1={yOf(equity)} y2={yOf(equity)} stroke="#26251e" strokeDasharray="3 3" strokeWidth="1" opacity="0.55" />
            <text x={padL + 5} y={yOf(equity) - 5} textAnchor="start" style={{ font: '500 10px var(--font-dm-sans)', fill: 'rgba(38,37,30,0.55)', letterSpacing: 0.7, textTransform: 'uppercase' }}>
              Eigenkapital
            </text>
          </g>
        )}

        {rows.map((row, i) => {
          const showLabel = years <= 12 || (row.year % (years <= 20 ? 2 : years <= 30 ? 3 : 5) === 0) || i === years - 1
          if (!showLabel) return null
          return (
            <text key={i} x={xOf(row.year)} y={H - padB + 16} textAnchor="middle" style={{ font: '500 10px var(--font-jetbrains-mono), monospace', fill: 'rgba(38,37,30,0.5)' }}>
              J{row.year}
            </text>
          )
        })}

        {data.map((d, i) => (
          <rect key={i} x={xOf(d.year) - plotW / years / 2} y={padT} width={plotW / years} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}

        {hover !== null && (() => {
          const d = data[hover]
          const cx = xOf(d.year)
          const boxW = 160, boxH = 58
          let bx = cx + 10
          if (bx + boxW > W - padR) bx = cx - boxW - 10
          const by = Math.max(padT, Math.min(padT, yOf(d.balance) - boxH - 10))
          return (
            <g style={{ pointerEvents: 'none' }}>
              <line x1={cx} x2={cx} y1={padT} y2={H - padB} stroke="rgba(38,37,30,0.25)" strokeDasharray="2 2" />
              <rect x={bx} y={by} width={boxW} height={boxH} rx={6} fill="#26251e" />
              <text x={bx + 10} y={by + 16} style={{ font: '500 10px var(--font-dm-sans)', fill: 'rgba(242,241,237,0.55)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Jahr {d.year}
              </text>
              <g>
                <rect x={bx + 10} y={by + 23} width="6" height="6" rx="1" fill="#E5E7EB" />
                <text x={bx + 22} y={by + 29} style={{ font: '500 11px var(--font-jetbrains-mono), monospace', fill: '#f2f1ed' }}>
                  Restschuld {fmtEUR(d.balance)}
                </text>
              </g>
              <g>
                <rect x={bx + 10} y={by + 37} width="6" height="6" rx="1" fill="#1C1C1C" />
                <text x={bx + 22} y={by + 43} style={{ font: '500 11px var(--font-jetbrains-mono), monospace', fill: '#f2f1ed' }}>
                  Getilgt {fmtEUR(d.tilgungSum)}
                </text>
              </g>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ANALYZER SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════

function InputGroup({ label, children, tight = false }: { label: string; children: React.ReactNode; tight?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tight ? 8 : 10 }}>
      <span style={{ font: '500 10.5px/1.27 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#26251e' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

function Divider() {
  return <span style={{ height: 1, background: 'rgba(38,37,30,0.08)', display: 'block' }} />
}

function KpiCard({ label, value, hint, color = '#26251e', info }: { label: string; value: string; hint?: string; color?: string; info?: string }) {
  return (
    <div style={{ padding: 18, borderRadius: 10, background: '#ffffff', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={{ font: '500 10.5px/1.27 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.5)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span>{label}</span>
        {info && <InfoTip content={info} />}
      </span>
      <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: 500, fontSize: 22, color, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.6, transition: 'color 250ms ease' }}>
        {value}
      </span>
      {hint && <span style={{ font: '400 12px/1.35 var(--font-dm-sans), sans-serif', color: 'rgba(38,37,30,0.5)' }}>{hint}</span>}
    </div>
  )
}

function ScoreDial({ score = 0, size = 160, tone = 'good' }: { score?: number; size?: number; tone?: ExtTone }) {
  const TICKS = 60
  const radius = size / 2
  const inner = radius - 22
  const outer = radius - 6
  const activeCount = Math.round((score / 100) * TICKS)
  const colors: Record<ExtTone, string> = { good: '#1f8a65', elite: '#b8921a', warn: '#c08532', bad: '#cf2d56', neutral: 'rgba(38,37,30,0.5)' }
  const activeColor = colors[tone]
  const dimColor = 'rgba(38,37,30,0.14)'

  const ticks = []
  for (let i = 0; i < TICKS; i++) {
    const angle = Math.PI / 2 + (i / TICKS) * 2 * Math.PI
    const x1 = radius + inner * Math.cos(angle)
    const y1 = radius + inner * Math.sin(angle)
    const x2 = radius + outer * Math.cos(angle)
    const y2 = radius + outer * Math.sin(angle)
    ticks.push(
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i < activeCount ? activeColor : dimColor} strokeWidth={2.2} strokeLinecap="round" style={{ transition: 'stroke 260ms ease' }} />
    )
  }

  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {ticks}
        <text x={radius} y={radius} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontWeight: 500, fontSize: size * 0.32, fill: activeColor, letterSpacing: -1, transition: 'fill 260ms ease' }}>
          {score}
        </text>
        <text x={radius} y={radius + size * 0.19} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontWeight: 500, fontSize: size * 0.085, fill: 'rgba(38,37,30,0.42)', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          von 100
        </text>
      </svg>
    </div>
  )
}

function SumRow({ k, v, bold, color }: { k: string; v: string; bold?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={{ font: '500 10.5px/1.27 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.5)' }}>
        {k}
      </span>
      <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: bold ? 600 : 500, fontSize: bold ? 17 : 15, color: color || '#26251e', fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3 }}>
        {v}
      </span>
    </div>
  )
}

function WaterRow({ color, label, value, width, strong = false, valueColor }: { color: string; label: string; value: string; width: number; strong?: boolean; valueColor?: string }) {
  return (
    <>
      <span style={{ font: '500 10.5px/1.27 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: strong ? '#26251e' : 'rgba(38,37,30,0.55)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />{label}
      </span>
      <span style={{ height: 8, borderRadius: 4, background: 'rgba(38,37,30,0.06)', overflow: 'hidden', display: 'block' }}>
        <span style={{ display: 'block', height: '100%', width: `${Math.max(1, Math.min(100, width * 100))}%`, background: color, borderRadius: 4, transition: 'width 280ms cubic-bezier(0.16, 1, 0.3, 1)' }} />
      </span>
      <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: strong ? 600 : 500, fontVariantNumeric: 'tabular-nums', textAlign: 'right', color: valueColor || '#26251e', fontSize: strong ? 15 : 14 }}>
        {value}
      </span>
    </>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      <span style={{ font: '500 11.5px/1 var(--font-dm-sans), sans-serif', color: 'rgba(38,37,30,0.65)' }}>{label}</span>
    </span>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN CALCULATOR / ANALYZER
// ═══════════════════════════════════════════════════════════

const DEFAULT_INPUTS: CalcInputs = {
  listingUrl: '',
  city: '',
  state: '',
  includeMakler: true,
  nkOverrides: {},
  price: '0',
  reno: '0',
  opCosts: '0',
  hausgeld: '0',
  equity: '0',
  rate: '3.5',
  amort: '1.5',
  term: '10',
  rent: '0',
  vacancy: '0',
  otherInc: '0',
  wohnflaeche: '0',
  zimmer: '0',
  baujahr: '',
}

export default function Calculator() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS)
  const [chart, setChart] = useState<'amort' | 'cashflow'>('amort')
  const [toast, setToast] = useState<string | null>(null)
  const [rentEstimated, setRentEstimated] = useState(false)
  const sessionStarted = useRef(false)

  const upd = useCallback(<K extends keyof CalcInputs>(k: K) => (v: CalcInputs[K]) => {
    if (!sessionStarted.current) {
      // Manual session — charge 1 token on the first edit (skip if a deal was loaded or analysis happened)
      sessionStarted.current = true
      if (hasTokens('manual_session')) {
        spendTokens('manual_session', 'Manueller Deal')
      }
    }
    setInputs((s) => ({ ...s, [k]: v }))
  }, [])

  // Hydrate from saved deal when navigated as /?deal=ID
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const id = params.get('deal')
    if (!id) return
    const found = findDealById(id)
    if (!found) return
    sessionStarted.current = true // loading a deal does not charge a manual session
    setInputs(found.inputs)
    setRentEstimated(false)
    setCurrentDealId(found.id)
    setLastSavedTitle(found.titel)
    // Clean URL so a refresh doesn't keep re-loading
    const url = new URL(window.location.href)
    url.searchParams.delete('deal')
    window.history.replaceState({}, '', url.toString())
  }, [])

  const r = calc(inputs)
  const state = dealState(r, 5)
  const rawTerm = parseFloat(inputs.term)
  const termYr = Math.max(1, Math.min(40, Math.round(isFinite(rawTerm) && rawTerm > 0 ? rawTerm : 10)))
  const projYrs = termYr + 5
  const rows = project10yr(r, projYrs)
  const score = dealScore(r)
  const cfBadge = r.monthlyCashflow >= 0 ? '#16A34A' : '#DC2626'
  const cfBarColor = '#1C1C1C'
  const isElite = score >= 95
  const extTone: ExtTone = isElite ? 'elite' : state.tone
  const extLabel = isElite ? 'Exzellenter Deal' : state.label

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleFill = useCallback((data: ListingData) => {
    sessionStarted.current = true // analysis charged tokens already; no manual_session charge
    const updates: Partial<CalcInputs> = {
      reno: '0',
      opCosts: '0',
      hausgeld: '0',
      rent: '0',
      otherInc: '0',
      equity: '0',
      vacancy: '0',
      wohnflaeche: '0',
      zimmer: '0',
      baujahr: '',
    }
    if (data.kaufpreis != null && data.kaufpreis > 0) {
      updates.price = String(Math.round(data.kaufpreis))
    }
    if (data.ort) {
      updates.city = data.ort
    }
    if (data.bundeslandCode) {
      updates.state = data.bundeslandCode
      updates.nkOverrides = {}
    }
    if (data.monthlyRent != null && data.monthlyRent > 0) {
      updates.rent = String(data.monthlyRent)
    }
    if (data.hatMakler === false) {
      updates.includeMakler = false
    }
    if (data.wohnflaeche != null && data.wohnflaeche > 0) {
      updates.wohnflaeche = String(data.wohnflaeche)
    }
    if (data.zimmer != null && data.zimmer > 0) {
      updates.zimmer = String(data.zimmer)
    }
    if (data.baujahr != null && data.baujahr > 0) {
      updates.baujahr = String(data.baujahr)
    }
    if (data.hausgeld != null && data.hausgeld > 0) {
      updates.hausgeld = String(Math.round(data.hausgeld))
    }
    setInputs((s) => ({ ...s, ...updates }))
    setRentEstimated(false)
  }, [])

  const [saveOpen, setSaveOpen] = useState(false)
  const [updateChoiceOpen, setUpdateChoiceOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [lastSavedTitle, setLastSavedTitle] = useState<string>('')
  const [currentDealId, setCurrentDealId] = useState<string | null>(null)
  const [unsavedExportPrompt, setUnsavedExportPrompt] = useState<ExportFormat | null>(null)
  const [pendingExportAfterSave, setPendingExportAfterSave] = useState<ExportFormat | null>(null)

  const onSave = () => {
    if (currentDealId) {
      // Loaded from "Meine Deals" — give the user the choice to overwrite or save as new.
      setUpdateChoiceOpen(true)
    } else {
      setSaveOpen(true)
    }
  }
  const onExport = () => setExportOpen(true)

  const handleUpdateExisting = useCallback(() => {
    if (!currentDealId) return
    const updated = updateDeal(currentDealId, {
      datum: new Date().toISOString(),
      inputs,
      kpis: buildKpis(r, score),
    })
    setUpdateChoiceOpen(false)
    if (!updated) {
      pushToast({ variant: 'error', message: 'Deal konnte nicht aktualisiert werden.' })
      return
    }
    setLastSavedTitle(updated.titel)
    showToast('✓ Deal aktualisiert')
    pushToast({ variant: 'success', message: 'Deal aktualisiert!' })
  }, [currentDealId, inputs, r, score])

  const openSaveAsNew = useCallback(() => {
    setUpdateChoiceOpen(false)
    setSaveOpen(true)
  }, [])

  const runCalculatorExport = useCallback(async (format: ExportFormat, dealId: string | null) => {
    const titleForFile = lastSavedTitle || (inputs.city ? `Immobilie ${inputs.city}` : 'BrickScore_Deal')
    const res = await runExport({
      format,
      titel: titleForFile,
      link: inputs.listingUrl,
      bilder: [],
      inputs,
      result: r,
      projection: rows,
      termYr,
      score,
      verdict: extLabel,
      pngTargetId: 'vestora-export-target',
      dealId,
    })
    return res
  }, [inputs, r, rows, termYr, score, extLabel, lastSavedTitle])

  const handleSaveDeal = useCallback((data: { titel: string; link: string; notizen: string; bilder: string[] }) => {
    const deal: SavedDeal = {
      id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      titel: data.titel,
      link: data.link,
      notizen: data.notizen,
      bilder: data.bilder,
      datum: new Date().toISOString(),
      inputs,
      kpis: buildKpis(r, score),
    }
    persistDeal(deal)
    setLastSavedTitle(data.titel)
    setCurrentDealId(deal.id)
    setSaveOpen(false)
    showToast('✓ Deal gespeichert')
    pushToast({ variant: 'success', message: 'Deal gespeichert!' })

    // If a "save & export" flow was queued, kick off the export now
    if (pendingExportAfterSave) {
      const fmt = pendingExportAfterSave
      setPendingExportAfterSave(null)
      setExporting(true)
      void runCalculatorExport(fmt, deal.id)
        .then((res) => {
          showToast(res.truncated ? '✓ Heruntergeladen — Datei zu groß zum Speichern' : '✓ Export erstellt')
          pushToast({ variant: 'success', message: 'Export wurde erstellt und heruntergeladen.' })
        })
        .catch((e) => showToast(`Export fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}`))
        .finally(() => { setExporting(false); setExportOpen(false) })
    }
  }, [inputs, r, score, pendingExportAfterSave, runCalculatorExport])

  const handleExport = useCallback(async (format: ExportFormat) => {
    if (!currentDealId) {
      // Ask the user whether to save first or export-only
      setUnsavedExportPrompt(format)
      return
    }
    setExporting(true)
    try {
      const res = await runCalculatorExport(format, currentDealId)
      setExportOpen(false)
      showToast(res.truncated ? '✓ Heruntergeladen — Datei zu groß zum Speichern' : '✓ Export erstellt')
      pushToast({ variant: 'success', message: 'Export wurde erstellt und heruntergeladen.' })
    } catch (e) {
      showToast(`Export fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setExporting(false)
    }
  }, [currentDealId, runCalculatorExport])

  const handleExportOnlyFromPrompt = useCallback(async () => {
    if (!unsavedExportPrompt) return
    const fmt = unsavedExportPrompt
    setUnsavedExportPrompt(null)
    setExporting(true)
    try {
      await runCalculatorExport(fmt, null)
      setExportOpen(false)
      showToast('✓ Export erstellt — nicht im Deal-Verlauf gespeichert')
      pushToast({ variant: 'success', message: 'Export wurde erstellt und heruntergeladen.' })
    } catch (e) {
      showToast(`Export fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setExporting(false)
    }
  }, [unsavedExportPrompt, runCalculatorExport])

  const handleSaveAndExportFromPrompt = useCallback(() => {
    if (!unsavedExportPrompt) return
    setPendingExportAfterSave(unsavedExportPrompt)
    setUnsavedExportPrompt(null)
    setSaveOpen(true)
  }, [unsavedExportPrompt])

  return (
    <>
      <SaveDealModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        defaultLink={inputs.listingUrl}
        onSave={handleSaveDeal}
      />

      {/* Update vs new-save choice (only when an existing deal is loaded) */}
      {updateChoiceOpen && (
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) setUpdateChoiceOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{
            width: '100%', maxWidth: 460,
            background: '#ffffff', borderRadius: 12,
            padding: '22px 24px 20px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <h3 style={{ margin: 0, font: '600 17px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>
              Deal speichern
            </h3>
            <p style={{ margin: 0, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
              Du bearbeitest{lastSavedTitle ? ` "${lastSavedTitle}"` : ' einen gespeicherten Deal'}. Möchtest du den bestehenden Deal aktualisieren oder als neuen Deal speichern?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={openSaveAsNew}
                style={{ padding: '9px 16px', borderRadius: 8, background: '#ffffff', border: '1px solid #d8d8d8', font: '500 13px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', cursor: 'pointer' }}
              >
                Als neuen Deal speichern
              </button>
              <button
                type="button"
                onClick={handleUpdateExisting}
                style={{
                  padding: '9px 16px', borderRadius: 8,
                  background: 'linear-gradient(to bottom, #3d3d3d, #141414)',
                  border: '1px solid rgba(0,0,0,0.5)',
                  font: '500 13px/1 var(--font-dm-sans), sans-serif', color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.18)',
                }}
              >
                Deal aktualisieren
              </button>
            </div>
          </div>
        </div>
      )}

      <ExportDealModal
        open={exportOpen}
        onClose={() => { if (!exporting) setExportOpen(false) }}
        onExport={(f) => { void handleExport(f) }}
        busy={exporting}
      />

      {/* Unsaved-deal export prompt */}
      {unsavedExportPrompt && (
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) setUnsavedExportPrompt(null) }}
          style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{
            width: '100%', maxWidth: 440,
            background: '#ffffff', borderRadius: 12,
            padding: '22px 24px 20px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <h3 style={{ margin: 0, font: '600 17px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>
              Deal noch nicht gespeichert
            </h3>
            <p style={{ margin: 0, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
              Möchtest du den Deal jetzt speichern, damit der Export im Verlauf erhalten bleibt?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { void handleExportOnlyFromPrompt() }}
                style={{ padding: '9px 16px', borderRadius: 8, background: '#ffffff', border: '1px solid #d8d8d8', font: '500 13px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', cursor: 'pointer' }}
              >
                Nur exportieren
              </button>
              <button
                type="button"
                onClick={handleSaveAndExportFromPrompt}
                style={{
                  padding: '9px 16px', borderRadius: 8,
                  background: 'linear-gradient(to bottom, #3d3d3d, #141414)',
                  border: '1px solid rgba(0,0,0,0.5)',
                  font: '500 13px/1 var(--font-dm-sans), sans-serif', color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.18)',
                }}
              >
                Speichern & exportieren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: '#26251e', color: '#f7f7f4', padding: '10px 18px', borderRadius: 9999,
          font: '500 13px var(--font-dm-sans), sans-serif', zIndex: 60,
          boxShadow: '0 14px 32px rgba(0,0,0,0.2)',
          animation: 'v-fade-in 200ms ease',
        }}>
          {toast}
        </div>
      )}

      <div className="bs-calc-wrap" style={{ padding: '28px 24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── CALCULATOR GRID ── */}
        <div className="bs-calc-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 24, alignItems: 'start' }}>

        {/* ── SIDEBAR ── */}
        <aside className="bs-calc-aside" style={{ alignSelf: 'start', position: 'sticky', top: 88, padding: 16, borderRadius: 12, background: '#ffffff', border: '1px solid #e5e5e5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <ListingImport url={inputs.listingUrl} onUrlChange={upd('listingUrl')} onFill={handleFill} />
          <Divider />

          <InputGroup label="Standort">
            <CityInput
              value={inputs.city}
              stateCode={inputs.state}
              onPick={(city, stateCode, isTyping) => {
                setInputs((s) => {
                  if (isTyping && (!city || city.trim() === '')) {
                    return { ...s, city: '', state: '', nkOverrides: {} }
                  }
                  return {
                    ...s, city,
                    state: isTyping ? s.state : stateCode,
                    nkOverrides: isTyping ? s.nkOverrides : {},
                  }
                })
              }}
            />
          </InputGroup>
          <Divider />

          <InputGroup label="Objektdaten">
            <NumberInput label="Wohnfläche" suffix="m²" value={inputs.wohnflaeche} onChange={upd('wohnflaeche')} info="Wohnfläche der Immobilie in Quadratmetern — Grundlage für Kaufpreis pro m² und Gesamtkosten pro m²." />
            <div className="bs-input-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'end' }}>
              <NumberInput label="Zimmer" value={inputs.zimmer} onChange={upd('zimmer')} info="Anzahl der Zimmer — Dezimalwerte wie 2,5 sind möglich." />
              <NumberInput label="Baujahr" value={inputs.baujahr} onChange={upd('baujahr')} placeholder="z. B. 1995" raw info="Baujahr der Immobilie — relevant für Modernisierungs- und Sanierungsbedarf." />
            </div>
          </InputGroup>
          <Divider />

          <InputGroup label="Kosten">
            <NumberInput label="Kaufpreis" prefix="€" value={inputs.price} onChange={upd('price')} info="Der mit dem Verkäufer vereinbarte Preis für die Immobilie — ohne Kaufnebenkosten (Grunderwerbsteuer, Notar, Grundbuch, Makler)." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ font: '500 10.5px/1.27 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.5)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span>Nebenkosten</span>
                <InfoTip content="Grunderwerbsteuer, Notar, Grundbuch und optional Makler. Werte stammen aus den Standards des gewählten Bundeslands und sind pro Position einzeln editierbar." />
              </label>
              <NebenkostenEditor
                state={inputs.state}
                includeMakler={inputs.includeMakler}
                onToggleMakler={() => upd('includeMakler')(!inputs.includeMakler)}
                overrides={inputs.nkOverrides}
                onOverride={(key, val) => setInputs((s) => {
                  const o = { ...(s.nkOverrides || {}) }
                  if (isNaN(val)) { delete o[key] } else { o[key] = val }
                  return { ...s, nkOverrides: o }
                })}
                onReset={() => setInputs((s) => ({ ...s, nkOverrides: {} }))}
                price={+inputs.price || 0}
              />
            </div>
            <NumberInput label="Renovierung" prefix="€" value={inputs.reno} onChange={upd('reno')} info="Einmalige Modernisierungs- und Instandsetzungskosten, die vor oder kurz nach dem Kauf anfallen." />
            <div className="bs-input-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'end' }}>
              <NumberInput label="Laufende Kosten / Monat" prefix="€" value={inputs.opCosts} onChange={upd('opCosts')} info="Monatliche nicht umlegbare Bewirtschaftungskosten: Verwaltung, Instandhaltungsrücklage, Versicherungen, Grundsteuer — ohne Kapitaldienst." />
              <NumberInput label="Hausgeld / Monat" prefix="€" value={inputs.hausgeld} onChange={upd('hausgeld')} info="Monatliches Hausgeld bei Eigentumswohnungen (Instandhaltungsrücklage, Verwaltung, etc.) — wird zu den laufenden Kosten addiert." />
            </div>
          </InputGroup>
          <Divider />

          <InputGroup label="Finanzierung">
            <NumberInput label="Eigenkapital" prefix="€" value={inputs.equity} onChange={upd('equity')} info="Eigene Mittel, die in den Deal fließen — reduziert den Darlehensbetrag." />
            <div className="bs-input-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'end' }}>
              <NumberInput label="Zinssatz" suffix="%" value={inputs.rate} onChange={upd('rate')} info="Nominaler Sollzins des Annuitätendarlehens pro Jahr." />
              <NumberInput label="Tilgung" suffix="%" value={inputs.amort} onChange={upd('amort')} info="Anfängliche Tilgung in % p. a. — Anteil der Rate, der die Restschuld reduziert." />
            </div>
            <NumberInput label="Laufzeit" suffix="Jahre" value={inputs.term} onChange={upd('term')} info="Betrachtungszeitraum der Finanzierung in Jahren." />
          </InputGroup>
          <Divider />

          <InputGroup label="Einnahmen">
            <NumberInput label="Monatsmiete" prefix="€" value={inputs.rent} onChange={(v) => { upd('rent')(v); if (rentEstimated) setRentEstimated(false) }} hint={rentEstimated ? 'Automatisch geschätzt — bitte prüfen' : undefined} info="Kaltmiete aller Einheiten pro Monat." />
            <NumberInput label="Sonstige Einnahmen" prefix="€" value={inputs.otherInc} onChange={upd('otherInc')} info="Zusätzliche monatliche Einnahmen wie Stellplatz- oder Garagenmieten." />
            <NumberInput label="Leerstand" suffix="%" value={inputs.vacancy} onChange={upd('vacancy')} info="Angenommener Mietausfall in % der Bruttomiete — Puffer für leere Einheiten und Mieterwechsel." />
          </InputGroup>
        </aside>

        {/* ── MAIN ── */}
        <main id="vestora-export-target" style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Verdict + Score cards */}
          <div className="bs-calc-verdict" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <section style={{ padding: '20px 24px', borderRadius: 12, background: '#ffffff', border: '1px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
              <Pill tone={extTone} dot>{extLabel}</Pill>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-dm-sans), sans-serif', fontWeight: 400, fontSize: 44, lineHeight: 1.05, letterSpacing: -1, color: '#26251e' }}>
                <span style={{ color: cfBadge, fontVariantNumeric: 'tabular-nums', transition: 'color 250ms ease', display: 'block' }}>
                  {fmtEUR(r.monthlyCashflow, { sign: true })}
                </span>
                <span style={{ color: 'rgba(38,37,30,0.35)', fontSize: 23, letterSpacing: -0.2, fontWeight: 500, textTransform: 'uppercase', display: 'inline-block', marginTop: 6 }}>
                  pro Monat
                </span>
              </h2>
            </section>

            <section style={{ padding: '20px 24px', borderRadius: 12, background: '#ffffff', border: '1px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minWidth: 0 }}>
              <span style={{ font: '500 10.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.5)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Deal-Score
                <InfoTip content="Zusammenfassende Bewertung auf Basis von Cashflow, Netto-Rendite, Cash-on-Cash und LTV. Maximal 100 Punkte." />
              </span>
              <ScoreDial score={score} tone={extTone} size={160} />
            </section>
          </div>

          {/* KPI grid */}
          <div className="bs-calc-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            <KpiCard label="Monats-Cashflow" value={fmtEUR(r.monthlyCashflow, { sign: true })} color={r.monthlyCashflow >= 0 ? '#1f8a65' : '#cf2d56'} hint="Effektiv pro Monat." info="Monatlicher Überschuss nach Abzug von laufenden Kosten und Kapitaldienst." />
            <KpiCard label="Jahres-Cashflow" value={fmtEUR(r.annualCashflow, { sign: true })} color={r.annualCashflow >= 0 ? '#1f8a65' : '#cf2d56'} hint="Vor Steuern." info="Monats-Cashflow × 12 vor Einkommensteuer." />
            <KpiCard label="Netto-Rendite" value={fmtPct(r.netYield)} hint="Nach laufenden Kosten." info="Jahresnettokaltmiete geteilt durch Gesamtinvest (Kaufpreis + Nebenkosten + Renovierung)." />
            <KpiCard label="Cash-on-Cash" value={fmtPct(r.coc)} color={r.coc >= 0 ? '#1f8a65' : '#cf2d56'} hint={`Auf ${fmtEUR(r.equity)} EK.`} info="Jahres-Cashflow geteilt durch eingesetztes Eigenkapital — die wichtigste Kennzahl für Investoren." />
            <KpiCard label="LTV" value={fmtPct(r.ltv)} hint="Darlehen / Kaufpreis." info="Loan-to-Value: Darlehensbetrag geteilt durch Kaufpreis. Je niedriger, desto geringer das Finanzierungsrisiko." />
          </div>

          {/* Deal Summary */}
          <section style={{ padding: 18, borderRadius: 12, background: '#ffffff', border: '1px solid #e5e5e5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, font: '400 22px/1.3 var(--font-dm-sans), sans-serif', letterSpacing: -0.11, color: '#26251e' }}>
              Deal Summary
            </h3>

            <div className="bs-calc-sumrow" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, paddingBottom: 16, borderBottom: '1px solid rgba(38,37,30,0.08)' }}>
              <SumRow k="Kaufpreis" v={fmtEUR(r.price)} />
              <SumRow k={`Nebenkosten · ${r.nkPct.toFixed(1)}%`} v={fmtEUR(r.nebenkosten)} />
              <SumRow k="Renovierung" v={fmtEUR(r.reno)} />
              <SumRow k="Gesamtkosten" v={fmtEUR(r.gesamt)} bold />
            </div>

            <div className="bs-calc-sumrow" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, paddingBottom: 16, borderBottom: '1px solid rgba(38,37,30,0.08)' }}>
              <SumRow k="Eigenkapital" v={fmtEUR(r.equity)} />
              <SumRow k="Darlehen" v={fmtEUR(r.loan)} />
              <SumRow k="Monatsrate" v={fmtEUR(-r.monthlyDebt)} />
              <SumRow k="Zins / Tilgung" v={`${String(inputs.rate).replace('.', ',')}% / ${String(inputs.amort).replace('.', ',')}%`} />
            </div>

            <div className="bs-calc-sumrow" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, paddingBottom: 16, borderBottom: '1px solid rgba(38,37,30,0.08)' }}>
              <SumRow k="Kaufpreis / m²" v={r.wohnflaeche > 0 ? `${fmtEUR(r.pricePerSqm)}/m²` : '—'} />
              <SumRow k="Brutto-Mietrendite" v={r.price > 0 ? fmtPct(r.bruttoMietrendite) : '—'} />
              <SumRow k="Gesamtkosten / m²" v={r.wohnflaeche > 0 ? `${fmtEUR(r.totalCostPerSqm)}/m²` : '—'} />
              <span />
            </div>

            <div className="bs-calc-water" style={{ display: 'grid', gridTemplateColumns: '150px 1fr 120px', rowGap: 12, columnGap: 14, alignItems: 'center' }}>
              <WaterRow color="#1C1C1C" label="Effektive Miete" value={fmtEUR(r.effectiveRentMon)} width={1} />
              <WaterRow color="#1C1C1C" label="Laufende Kosten" value={fmtEUR(-r.totalOpMon)} width={r.effectiveRentMon > 0 ? r.totalOpMon / r.effectiveRentMon : 0} valueColor="#26251e" />
              <WaterRow color="#1C1C1C" label="Kapitaldienst" value={fmtEUR(-r.monthlyDebt)} width={r.effectiveRentMon > 0 ? r.monthlyDebt / r.effectiveRentMon : 0} valueColor="#26251e" />
              <span style={{ font: '500 10.5px/1.27 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#26251e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: cfBarColor }} />
                Cashflow
              </span>
              <span style={{ height: 10, borderRadius: 5, background: 'rgba(38,37,30,0.06)', overflow: 'hidden', display: 'block' }}>
                <span style={{ display: 'block', height: '100%', width: `${Math.max(1.5, Math.min(100, r.effectiveRentMon > 0 ? Math.abs(r.monthlyCashflow) / r.effectiveRentMon * 100 : 0))}%`, background: cfBarColor, borderRadius: 5, transition: 'width 280ms cubic-bezier(0.16, 1, 0.3, 1)' }} />
              </span>
              <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: 600, fontSize: 15, fontVariantNumeric: 'tabular-nums', textAlign: 'right', color: cfBadge }}>
                {fmtEUR(r.monthlyCashflow, { sign: true })}
              </span>
            </div>
          </section>

          {/* Charts */}
          <section className="bs-calc-chart-card" style={{ padding: '12px 16px', borderRadius: 12, background: '#ffffff', border: '1px solid #e5e5e5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="bs-calc-chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <h3 className="bs-calc-chart-title" style={{ margin: 0, font: '400 22px/1.3 var(--font-dm-sans), sans-serif', letterSpacing: -0.11, color: '#26251e' }}>
                {termYr}-Jahres-Projektion{' '}
                <span className="bs-calc-chart-subtitle" style={{ color: 'rgba(38,37,30,0.4)', fontSize: 14 }}>+ {projYrs - termYr}-Jahres-Projektion</span>
              </h3>
              <div style={{ display: 'inline-flex', padding: 3, borderRadius: 10, background: '#e8e8e8', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
                {([{ k: 'amort', label: 'Restschuld vs. Tilgung' }, { k: 'cashflow', label: 'Cashflow' }] as const).map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setChart(t.k)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 7,
                      border: chart === t.k ? '1px solid rgba(0,0,0,0.4)' : '1px solid transparent',
                      background: chart === t.k ? 'linear-gradient(to bottom, #3d3d3d, #141414)' : 'transparent',
                      color: chart === t.k ? '#f7f7f4' : 'rgba(38,37,30,0.6)',
                      font: '500 12px var(--font-dm-sans), sans-serif',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      boxShadow: chart === t.k ? '0 1px 2px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.07)' : 'none',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {chart === 'cashflow' ? (
                <>
                  <LegendItem color="#1C1C1C" label="Positiver Cashflow" />
                  <LegendItem color="#DC2626" label="Negativer Cashflow" />
                  <span style={{ marginLeft: 'auto', font: '500 10.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.45)' }}>
                    Kumuliert {rows.length}J ·{' '}
                    <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: (rows[rows.length - 1]?.cumCf ?? 0) >= 0 ? '#1f8a65' : '#cf2d56', textTransform: 'none', letterSpacing: 0 }}>
                      {fmtEUR(rows[rows.length - 1]?.cumCf ?? 0, { sign: true })}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <LegendItem color="#9CA3AF" label="Restschuld" />
                  <LegendItem color="#1C1C1C" label="Getilgt (kumuliert)" />
                  <span style={{ marginLeft: 'auto', font: '500 10.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.45)' }}>
                    Restschuld nach {termYr}J ·{' '}
                    <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#26251e', textTransform: 'none', letterSpacing: 0 }}>
                      {fmtEUR(rows[Math.min(termYr, rows.length) - 1]?.balance ?? 0)}
                    </span>
                  </span>
                </>
              )}
            </div>

            <div style={{ marginTop: 4 }}>
              {chart === 'cashflow'
                ? <CashflowChart rows={rows} termYear={termYr} />
                : <AmortChart rows={rows} loan={r.loan} equity={r.equity} termYear={termYr} />
              }
            </div>
          </section>

          {/* ── ACTION BUTTONS — full-width row below projection ── */}
          <div className="bs-calc-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <button
              onClick={onSave}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                width: '100%', padding: '10px 24px',
                background: '#1C1C1C',
                color: '#FFFFFF', borderRadius: 10,
                border: 'none',
                font: '500 14px/1 var(--font-dm-sans), Inter, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#2C2C2C' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1C1C1C' }}
            >
              <VIcon name="bookmark" size={16} />
              Deal speichern
            </button>
            <button
              onClick={onExport}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                width: '100%', padding: '10px 24px',
                background: '#1C1C1C',
                color: '#FFFFFF', borderRadius: 10,
                border: 'none',
                font: '500 14px/1 var(--font-dm-sans), Inter, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#2C2C2C' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1C1C1C' }}
            >
              <VIcon name="download" size={16} />
              Deal exportieren
            </button>
          </div>
        </main>

        </div>{/* end calculator grid */}
      </div>{/* end flex wrapper */}
    </>
  )
}
