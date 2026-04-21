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
            font: '400 12px/1.45 var(--font-space-grotesk), sans-serif',
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

function Pill({ tone = 'neutral', children, dot = false }: { tone?: DealTone; children: React.ReactNode; dot?: boolean }) {
  const tones: Record<DealTone, { bg: string; fg: string; dot: string }> = {
    neutral: { bg: '#e6e5e0', fg: 'rgba(38,37,30,0.7)', dot: 'rgba(38,37,30,0.4)' },
    good:    { bg: 'rgba(31,138,101,0.14)', fg: '#1f8a65', dot: '#1f8a65' },
    warn:    { bg: 'rgba(192,133,50,0.16)', fg: '#8b5f22', dot: '#c08532' },
    bad:     { bg: 'rgba(207,45,86,0.12)', fg: '#cf2d56', dot: '#cf2d56' },
  }
  const t = tones[tone]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 11px', borderRadius: 9999,
      background: t.bg, color: t.fg,
      font: '500 13px/1 var(--font-space-grotesk), sans-serif',
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
  label, value, onChange, prefix, suffix, hint, placeholder, info,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
  hint?: string
  placeholder?: string
  info?: string
}) {
  const [focused, setFocused] = useState(false)
  const displayValue = focused ? String(value ?? '') : fmtNum(value)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          font: '500 10.5px/1.27 var(--font-space-grotesk), sans-serif',
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
        background: '#fafaf7',
        border: `1px solid ${focused ? 'rgba(38,37,30,0.35)' : 'rgba(38,37,30,0.1)'}`,
        transition: 'border-color 150ms ease',
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
        <span style={{ font: '400 11.5px/1.35 var(--font-space-grotesk), sans-serif', color: 'rgba(38,37,30,0.45)' }}>
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
        background: '#fafaf7',
        border: `1px solid ${focus ? 'rgba(38,37,30,0.35)' : 'rgba(38,37,30,0.1)'}`,
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
            fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
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
          background: '#f7f7f4', borderRadius: 8,
          boxShadow: '0 14px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(38,37,30,0.12)',
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
                <span style={{ font: '500 13.5px var(--font-space-grotesk), sans-serif', color: '#26251e' }}>{m.city}</span>
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
      background: disabled ? 'rgba(38,37,30,0.04)' : '#fafaf7',
      border: `1px solid ${focused ? 'rgba(38,37,30,0.35)' : 'rgba(38,37,30,0.1)'}`,
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
  const comps = nkComponents(state, true, overrides)
  const makler = includeMakler ? comps.makler : 0
  const totalPct = comps.grest + comps.notar + comps.grundbuch + makler
  const totalEur = price * totalPct / 100
  const hasOverride = overrides && Object.keys(overrides).length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 8, background: '#fafaf7', border: '1px solid rgba(38,37,30,0.1)', overflow: 'hidden' }}>
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
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '500 11.5px/1 var(--font-space-grotesk), sans-serif', color: 'rgba(38,37,30,0.55)' }}>
          {open ? 'Weniger' : 'Mehr'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open && (
        <div style={{ padding: '4px 12px 8px', borderTop: '1px solid rgba(38,37,30,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, paddingBottom: 2 }}>
            {hasOverride && (
              <button
                onClick={(e) => { e.stopPropagation(); onReset() }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(38,37,30,0.5)', font: '500 10.5px/1 var(--font-space-grotesk), sans-serif', letterSpacing: 0.4, textTransform: 'uppercase' }}
              >
                Zurücksetzen
              </button>
            )}
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
                  <span style={{ font: '500 12.5px/1.25 var(--font-space-grotesk), sans-serif', color: '#26251e' }}>{row.label}</span>
                  <span style={{ font: '400 10.5px/1.2 var(--font-space-grotesk), sans-serif', color: 'rgba(38,37,30,0.45)' }}>
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
            <span style={{ font: '500 10.5px/1 var(--font-space-grotesk), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#26251e' }}>Summe</span>
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

function ListingImport({ url, onUrlChange }: { url: string; onUrlChange: (url: string) => void }) {
  const [status, setStatus] = useState<'idle' | 'importing' | 'done'>('idle')
  const source = useMemo(() => detectSource(url), [url])
  const isValidUrl = url && url.trim().length > 6 && /^https?:\/\//i.test(url.trim())
  const lastTriggered = useRef('')

  useEffect(() => {
    if (!isValidUrl) { setStatus('idle'); lastTriggered.current = ''; return }
    if (lastTriggered.current === url) return
    lastTriggered.current = url
    setStatus('importing')
    const t1 = setTimeout(() => setStatus('done'), 1200)
    const t2 = setTimeout(() => setStatus('idle'), 4200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [url, isValidUrl])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ font: '500 10.5px/1.27 var(--font-space-grotesk), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#26251e' }}>
          Inserat
        </span>
        {source && (
          <span style={{ font: '500 10px/1 var(--font-space-grotesk), sans-serif', letterSpacing: 0.4, textTransform: 'uppercase', color: source.color, background: source.bg, padding: '4px 7px', borderRadius: 4 }}>
            {source.label}
          </span>
        )}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 10px 9px 11px', borderRadius: 10, background: '#fff',
        boxShadow: `0 0 0 1px ${status === 'done' ? 'rgba(31,138,101,0.45)' : url ? 'rgba(38,37,30,0.18)' : 'rgba(38,37,30,0.1)'}`,
        transition: 'box-shadow 240ms ease',
      }}>
        <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 6, background: source ? source.bg : 'rgba(38,37,30,0.06)', color: source ? source.color : 'rgba(38,37,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 200ms ease, color 200ms ease' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6.5 9.5a2.5 2.5 0 0 0 3.54 0l2-2a2.5 2.5 0 0 0-3.54-3.54l-.7.7M9.5 6.5a2.5 2.5 0 0 0-3.54 0l-2 2a2.5 2.5 0 0 0 3.54 3.54l.7-.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Inserats-Link einfügen…"
          spellCheck={false}
          style={{ border: 'none', outline: 'none', background: 'transparent', padding: 0, margin: 0, flex: 1, minWidth: 0, font: '400 13px/1.35 var(--font-space-grotesk), sans-serif', color: '#26251e', textOverflow: 'ellipsis' }}
        />
        {status === 'importing' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(38,37,30,0.55)', font: '500 11px/1 var(--font-space-grotesk), sans-serif' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ animation: 'vestora-spin 0.9s linear infinite' }}>
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Lese…</span>
          </span>
        )}
        {status === 'done' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1f8a65', font: '500 11px/1 var(--font-space-grotesk), sans-serif' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Übernommen</span>
          </span>
        )}
        {url && status === 'idle' && (
          <button onClick={() => onUrlChange('')} title="Link entfernen" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, color: 'rgba(38,37,30,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <p style={{ margin: 0, font: '400 11px/1.4 var(--font-space-grotesk), sans-serif', color: 'rgba(38,37,30,0.5)' }}>
        Unterstützt Ihren Immobilienanbieter des Vertrauens.
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// CHARTS
// ═══════════════════════════════════════════════════════════

function CashflowChart({ rows, termYear }: { rows: ProjectionRow[]; termYear: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 640, H = 220
  const padL = 44, padR = 16, padT = 16, padB = 30
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
  const lineColor = avgCf >= 0 ? '#1f8a65' : '#cf2d56'
  const areaColor = avgCf >= 0 ? 'rgba(31,138,101,0.14)' : 'rgba(207,45,86,0.14)'

  const tickCount = 4
  const ticks: number[] = []
  for (let i = 0; i <= tickCount; i++) ticks.push(vMin + (span * i) / tickCount)

  const xTickEvery = years <= 12 ? 1 : years <= 20 ? 2 : years <= 30 ? 3 : 5
  const termX = termYear != null ? xOf(Math.min(termYear, years)) : null

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
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
            <text x={termX - 5} y={padT + 11} textAnchor="end" style={{ font: '500 9.5px var(--font-space-grotesk), sans-serif', fill: 'rgba(38,37,30,0.55)', letterSpacing: 0.4, textTransform: 'uppercase' }}>
              Laufzeitende
            </text>
          </g>
        )}

        <path d={areaPath} fill={areaColor} />
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {linePts.slice(1).map((p, i) => {
          const pos = data[i + 1].yearCf >= 0
          return (
            <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 4.5 : 3} fill={pos ? '#1f8a65' : '#cf2d56'} stroke="#f7f7f4" strokeWidth="1.5" />
          )
        })}

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
              <circle cx={cx} cy={cy} r="5" fill={pos ? '#1f8a65' : '#cf2d56'} stroke="#f7f7f4" strokeWidth="2" />
              <rect x={bx} y={by} width={boxW} height={boxH} rx={6} fill="#26251e" />
              <text x={bx + 10} y={by + 17} style={{ font: '500 10px var(--font-space-grotesk)', fill: 'rgba(242,241,237,0.6)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Jahr {row.year}{afterTerm ? ' · Projektion' : ''}
              </text>
              <text x={bx + 10} y={by + 34} style={{ font: '500 13px var(--font-jetbrains-mono), monospace', fill: pos ? '#9fd9b9' : '#f5a5b7', fontVariantNumeric: 'tabular-nums' }}>
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
  const W = 640, H = 220
  const padL = 44, padR = 16, padT = 16, padB = 30
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
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} onMouseLeave={() => setHover(null)}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yOf(t)} y2={yOf(t)} stroke="rgba(38,37,30,0.07)" strokeDasharray="2 3" />
            <text x={padL - 8} y={yOf(t) + 3} textAnchor="end" style={{ font: '500 10px var(--font-jetbrains-mono), monospace', fill: 'rgba(38,37,30,0.45)' }}>
              {fmtCompact(t)}
            </text>
          </g>
        ))}

        <path d={buildArea(balancePts, yOf(0))} fill="#c0a8dd" opacity="0.35" />
        <path d={buildPath(balancePts)} stroke="#8a6cb5" strokeWidth="1.75" fill="none" />
        <path d={buildArea(tilgungPts, yOf(0))} fill="#9fc9a2" opacity="0.4" />
        <path d={buildPath(tilgungPts)} stroke="#3f8a52" strokeWidth="1.75" fill="none" />

        {termYear != null && termYear < years && (() => {
          const tx = xOf(termYear)
          return (
            <g>
              <line x1={tx} x2={tx} y1={padT} y2={H - padB} stroke="rgba(38,37,30,0.5)" strokeDasharray="4 4" strokeWidth="1" />
              <rect x={tx} y={padT} width={W - padR - tx} height={plotH} fill="rgba(38,37,30,0.035)" />
              <text x={tx + 6} y={padT + 11} style={{ font: '500 9.5px var(--font-space-grotesk), sans-serif', fill: 'rgba(38,37,30,0.55)', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Laufzeitende · Projektion
              </text>
            </g>
          )
        })()}

        {equity > 0 && equity <= vMax && (
          <g>
            <line x1={padL} x2={W - padR} y1={yOf(equity)} y2={yOf(equity)} stroke="#26251e" strokeDasharray="3 3" strokeWidth="1" opacity="0.55" />
            <text x={W - padR - 4} y={yOf(equity) - 4} textAnchor="end" style={{ font: '500 10px var(--font-space-grotesk)', fill: '#26251e', letterSpacing: 0.4, textTransform: 'uppercase' }}>
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
              <circle cx={cx} cy={yOf(d.balance)} r="4" fill="#8a6cb5" stroke="#f2f1ed" strokeWidth="1.5" />
              <circle cx={cx} cy={yOf(d.tilgungSum)} r="4" fill="#3f8a52" stroke="#f2f1ed" strokeWidth="1.5" />
              <rect x={bx} y={by} width={boxW} height={boxH} rx={6} fill="#26251e" />
              <text x={bx + 10} y={by + 16} style={{ font: '500 10px var(--font-space-grotesk)', fill: 'rgba(242,241,237,0.55)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Jahr {d.year}
              </text>
              <g>
                <rect x={bx + 10} y={by + 23} width="6" height="6" rx="1" fill="#c0a8dd" />
                <text x={bx + 22} y={by + 29} style={{ font: '500 11px var(--font-jetbrains-mono), monospace', fill: '#f2f1ed' }}>
                  Restschuld {fmtEUR(d.balance)}
                </text>
              </g>
              <g>
                <rect x={bx + 10} y={by + 37} width="6" height="6" rx="1" fill="#9fc9a2" />
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
      <span style={{ font: '500 10.5px/1.27 var(--font-space-grotesk), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#26251e' }}>
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
    <div style={{ padding: 18, borderRadius: 10, background: '#f2f1ed', boxShadow: '0 0 0 1px rgba(38,37,30,0.08)', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={{ font: '500 10.5px/1.27 var(--font-space-grotesk), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.5)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span>{label}</span>
        {info && <InfoTip content={info} />}
      </span>
      <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: 500, fontSize: 22, color, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.6, transition: 'color 250ms ease' }}>
        {value}
      </span>
      {hint && <span style={{ font: '400 12px/1.35 var(--font-space-grotesk), sans-serif', color: 'rgba(38,37,30,0.5)' }}>{hint}</span>}
    </div>
  )
}

function ScoreDial({ score = 0, size = 160, tone = 'good' }: { score?: number; size?: number; tone?: DealTone }) {
  const TICKS = 60
  const radius = size / 2
  const inner = radius - 22
  const outer = radius - 6
  const activeCount = Math.round((score / 100) * TICKS)
  const colors: Record<DealTone, string> = { good: '#1f8a65', warn: '#c08532', bad: '#cf2d56', neutral: 'rgba(38,37,30,0.5)' }
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
        <text x={radius} y={radius} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 500, fontSize: size * 0.32, fill: activeColor, letterSpacing: -1, transition: 'fill 260ms ease' }}>
          {score}
        </text>
        <text x={radius} y={radius + size * 0.19} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 500, fontSize: size * 0.085, fill: 'rgba(38,37,30,0.42)', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          von 100
        </text>
      </svg>
    </div>
  )
}

function SumRow({ k, v, bold, color }: { k: string; v: string; bold?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={{ font: '500 10.5px/1.27 var(--font-space-grotesk), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.5)' }}>
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
      <span style={{ font: '500 10.5px/1.27 var(--font-space-grotesk), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: strong ? '#26251e' : 'rgba(38,37,30,0.55)', display: 'flex', alignItems: 'center', gap: 8 }}>
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
      <span style={{ font: '500 11.5px/1 var(--font-space-grotesk), sans-serif', color: 'rgba(38,37,30,0.65)' }}>{label}</span>
    </span>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN CALCULATOR / ANALYZER
// ═══════════════════════════════════════════════════════════

const DEFAULT_INPUTS: CalcInputs = {
  listingUrl: '',
  city: 'Berlin',
  state: 'BE',
  includeMakler: true,
  nkOverrides: {},
  price: '420000',
  reno: '10000',
  opCosts: '360',
  equity: '140000',
  rate: '3.5',
  amort: '1.5',
  term: '10',
  rent: '2480',
  vacancy: '3',
  otherInc: '0',
}

export default function Calculator() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS)
  const [chart, setChart] = useState<'amort' | 'cashflow'>('amort')
  const [toast, setToast] = useState<string | null>(null)

  const upd = useCallback(<K extends keyof CalcInputs>(k: K) => (v: CalcInputs[K]) => {
    setInputs((s) => ({ ...s, [k]: v }))
  }, [])

  const r = calc(inputs)
  const state = dealState(r, 5)
  const rawTerm = parseFloat(inputs.term)
  const termYr = Math.max(1, Math.min(40, Math.round(isFinite(rawTerm) && rawTerm > 0 ? rawTerm : 10)))
  const projYrs = termYr + 5
  const rows = project10yr(r, projYrs)
  const score = dealScore(r)
  const cfBadge = r.monthlyCashflow >= 0 ? '#1f8a65' : '#cf2d56'

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const onSave = () => showToast('✓ Deal gespeichert')

  const onExport = useCallback(() => {
    const sheet = document.getElementById('vestora-print-sheet')
    if (sheet) {
      const dateStr = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
      const printRows: [string, string][] = [
        ['Kaufpreis', fmtEUR(r.price)],
        ['Nebenkosten', `${fmtEUR(r.nebenkosten)}  ·  ${r.nkPct.toFixed(1)} %`],
        ['Renovierung', fmtEUR(r.reno)],
        ['Gesamtkosten', fmtEUR(r.gesamt)],
        ['—', ''],
        ['Eigenkapital', fmtEUR(r.equity)],
        ['Darlehen', fmtEUR(r.loan)],
        ['Monatsrate', fmtEUR(r.monthlyDebt)],
        ['LTV', fmtPct(r.ltv)],
        ['—', ''],
        ['Monats-Cashflow', fmtEUR(r.monthlyCashflow, { sign: true })],
        ['Jahres-Cashflow', fmtEUR(r.annualCashflow, { sign: true })],
        ['Netto-Rendite', fmtPct(r.netYield)],
        ['Cash-on-Cash', fmtPct(r.coc)],
      ]
      sheet.innerHTML = `
        <div class="p-header">
          <div class="p-brand">BrickScore</div>
          <div class="p-date">Deal-Zusammenfassung · ${dateStr}</div>
        </div>
        <h1 class="p-title">Deal-Analyse</h1>
        <div class="p-verdict">Bewertung: <strong>${state.label}</strong></div>
        <div class="p-rows">
          ${printRows.map(([k, v]) => k === '—' ? '<div class="p-sep"></div>' : `<div class="p-row"><span>${k}</span><span class="v">${v}</span></div>`).join('')}
        </div>
        <div class="p-foot">© BrickScore · Immobilien-Rechner</div>
      `
    }
    const prevTitle = document.title
    document.title = 'BrickScore_Deal'
    window.print()
    setTimeout(() => { document.title = prevTitle }, 500)
  }, [r, state.label])

  return (
    <>
      {/* Hidden print sheet */}
      <div id="vestora-print-sheet" aria-hidden="true" />

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: '#26251e', color: '#f7f7f4', padding: '10px 18px', borderRadius: 9999,
          font: '500 13px var(--font-space-grotesk), sans-serif', zIndex: 60,
          boxShadow: '0 14px 32px rgba(0,0,0,0.2)',
          animation: 'v-fade-in 200ms ease',
        }}>
          {toast}
        </div>
      )}

      <div style={{ padding: '28px 24px 60px', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 24 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ alignSelf: 'start', position: 'sticky', top: 88, padding: 16, borderRadius: 12, background: '#f7f7f4', boxShadow: '0 0 0 1px rgba(38,37,30,0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <ListingImport url={inputs.listingUrl} onUrlChange={upd('listingUrl')} />
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

          <InputGroup label="Kosten">
            <NumberInput label="Kaufpreis" prefix="€" value={inputs.price} onChange={upd('price')} info="Der mit dem Verkäufer vereinbarte Preis für die Immobilie — ohne Kaufnebenkosten (Grunderwerbsteuer, Notar, Grundbuch, Makler)." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ font: '500 10.5px/1.27 var(--font-space-grotesk), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.5)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
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
            <NumberInput label="Laufende Kosten / Monat" prefix="€" value={inputs.opCosts} onChange={upd('opCosts')} info="Monatliche nicht umlegbare Bewirtschaftungskosten: Verwaltung, Instandhaltungsrücklage, Versicherungen, Grundsteuer — ohne Kapitaldienst." />
          </InputGroup>
          <Divider />

          <InputGroup label="Finanzierung">
            <NumberInput label="Eigenkapital" prefix="€" value={inputs.equity} onChange={upd('equity')} info="Eigene Mittel, die in den Deal fließen — reduziert den Darlehensbetrag." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <NumberInput label="Zinssatz" suffix="%" value={inputs.rate} onChange={upd('rate')} info="Nominaler Sollzins des Annuitätendarlehens pro Jahr." />
              <NumberInput label="Tilgung" suffix="%" value={inputs.amort} onChange={upd('amort')} info="Anfängliche Tilgung in % p. a. — Anteil der Rate, der die Restschuld reduziert." />
            </div>
            <NumberInput label="Laufzeit" suffix="Jahre" value={inputs.term} onChange={upd('term')} info="Betrachtungszeitraum der Finanzierung in Jahren." />
          </InputGroup>
          <Divider />

          <InputGroup label="Einnahmen">
            <NumberInput label="Monatsmiete" prefix="€" value={inputs.rent} onChange={upd('rent')} info="Kaltmiete aller Einheiten pro Monat." />
            <NumberInput label="Sonstige Einnahmen" prefix="€" value={inputs.otherInc} onChange={upd('otherInc')} info="Zusätzliche monatliche Einnahmen wie Stellplatz- oder Garagenmieten." />
            <NumberInput label="Leerstand" suffix="%" value={inputs.vacancy} onChange={upd('vacancy')} info="Angenommener Mietausfall in % der Bruttomiete — Puffer für leere Einheiten und Mieterwechsel." />
          </InputGroup>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
            <button onClick={onSave} className="v-actionbtn">
              <VIcon name="bookmark" size={14} />
              <span>Deal speichern</span>
            </button>
            <button onClick={onExport} className="v-actionbtn">
              <VIcon name="download" size={14} />
              <span>Deal exportieren</span>
            </button>
          </div>

          {/* Verdict + Score cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <section style={{ padding: '20px 24px', borderRadius: 12, background: '#f7f7f4', boxShadow: '0 28px 70px rgba(0,0,0,0.10), 0 12px 28px rgba(0,0,0,0.08), 0 0 0 1px rgba(38,37,30,0.08)', display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
              <Pill tone={state.tone} dot>{state.label}</Pill>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 400, fontSize: 44, lineHeight: 1.05, letterSpacing: -1, color: '#26251e' }}>
                <span style={{ color: cfBadge, fontVariantNumeric: 'tabular-nums', transition: 'color 250ms ease', display: 'block' }}>
                  {fmtEUR(r.monthlyCashflow, { sign: true })}
                </span>
                <span style={{ color: 'rgba(38,37,30,0.35)', fontSize: 23, letterSpacing: -0.2, fontWeight: 500, textTransform: 'uppercase', display: 'inline-block', marginTop: 6 }}>
                  pro Monat
                </span>
              </h2>
            </section>

            <section style={{ padding: '20px 24px', borderRadius: 12, background: '#f7f7f4', boxShadow: '0 28px 70px rgba(0,0,0,0.10), 0 12px 28px rgba(0,0,0,0.08), 0 0 0 1px rgba(38,37,30,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minWidth: 0 }}>
              <span style={{ font: '500 10.5px/1 var(--font-space-grotesk), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.5)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Deal-Score
                <InfoTip content="Zusammenfassende Bewertung auf Basis von Cashflow, Netto-Rendite, Cash-on-Cash und LTV. Maximal 100 Punkte." />
              </span>
              <ScoreDial score={score} tone={state.tone} size={160} />
            </section>
          </div>

          {/* KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            <KpiCard label="Monats-Cashflow" value={fmtEUR(r.monthlyCashflow, { sign: true })} color={r.monthlyCashflow >= 0 ? '#1f8a65' : '#cf2d56'} hint="Effektiv pro Monat." info="Monatlicher Überschuss nach Abzug von laufenden Kosten und Kapitaldienst." />
            <KpiCard label="Jahres-Cashflow" value={fmtEUR(r.annualCashflow, { sign: true })} color={r.annualCashflow >= 0 ? '#1f8a65' : '#cf2d56'} hint="Vor Steuern." info="Monats-Cashflow × 12 vor Einkommensteuer." />
            <KpiCard label="Netto-Rendite" value={fmtPct(r.netYield)} hint="Nach laufenden Kosten." info="Jahresnettokaltmiete geteilt durch Gesamtinvest (Kaufpreis + Nebenkosten + Renovierung)." />
            <KpiCard label="Cash-on-Cash" value={fmtPct(r.coc)} hint={`Auf ${fmtEUR(r.equity)} EK.`} info="Jahres-Cashflow geteilt durch eingesetztes Eigenkapital — die wichtigste Kennzahl für Investoren." />
            <KpiCard label="LTV" value={fmtPct(r.ltv)} hint="Darlehen / Kaufpreis." info="Loan-to-Value: Darlehensbetrag geteilt durch Kaufpreis. Je niedriger, desto geringer das Finanzierungsrisiko." />
          </div>

          {/* Deal Summary */}
          <section style={{ padding: 18, borderRadius: 12, background: '#f2f1ed', boxShadow: '0 0 0 1px rgba(38,37,30,0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, font: '400 22px/1.3 var(--font-space-grotesk), sans-serif', letterSpacing: -0.11, color: '#26251e' }}>
              Deal Summary
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, paddingBottom: 16, borderBottom: '1px solid rgba(38,37,30,0.08)' }}>
              <SumRow k="Kaufpreis" v={fmtEUR(r.price)} />
              <SumRow k={`Nebenkosten · ${r.nkPct.toFixed(1)}%`} v={fmtEUR(r.nebenkosten)} />
              <SumRow k="Renovierung" v={fmtEUR(r.reno)} />
              <SumRow k="Gesamtkosten" v={fmtEUR(r.gesamt)} bold />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, paddingBottom: 16, borderBottom: '1px solid rgba(38,37,30,0.08)' }}>
              <SumRow k="Eigenkapital" v={fmtEUR(r.equity)} />
              <SumRow k="Darlehen" v={fmtEUR(r.loan)} />
              <SumRow k="Monatsrate" v={fmtEUR(-r.monthlyDebt)} />
              <SumRow k="Zins / Tilgung" v={`${String(inputs.rate).replace('.', ',')}% / ${String(inputs.amort).replace('.', ',')}%`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 120px', rowGap: 12, columnGap: 14, alignItems: 'center' }}>
              <WaterRow color="#9fc9a2" label="Effektive Miete" value={fmtEUR(r.effectiveRentMon)} width={1} />
              <WaterRow color="#dfa88f" label="Laufende Kosten" value={fmtEUR(-r.opMon)} width={r.effectiveRentMon > 0 ? r.opMon / r.effectiveRentMon : 0} valueColor="#26251e" />
              <WaterRow color="#c0a8dd" label="Kapitaldienst" value={fmtEUR(-r.monthlyDebt)} width={r.effectiveRentMon > 0 ? r.monthlyDebt / r.effectiveRentMon : 0} valueColor="#26251e" />
              <span style={{ font: '500 10.5px/1.27 var(--font-space-grotesk), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#26251e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: cfBadge }} />
                Cashflow
              </span>
              <span style={{ height: 10, borderRadius: 5, background: 'rgba(38,37,30,0.06)', overflow: 'hidden', display: 'block' }}>
                <span style={{ display: 'block', height: '100%', width: `${Math.max(1.5, Math.min(100, r.effectiveRentMon > 0 ? Math.abs(r.monthlyCashflow) / r.effectiveRentMon * 100 : 0))}%`, background: cfBadge, borderRadius: 5, transition: 'width 280ms cubic-bezier(0.16, 1, 0.3, 1)' }} />
              </span>
              <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: 600, fontSize: 15, fontVariantNumeric: 'tabular-nums', textAlign: 'right', color: cfBadge }}>
                {fmtEUR(r.monthlyCashflow, { sign: true })}
              </span>
            </div>
          </section>

          {/* Charts */}
          <section style={{ padding: 18, borderRadius: 12, background: '#f7f7f4', boxShadow: '0 0 0 1px rgba(38,37,30,0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, font: '400 22px/1.3 var(--font-space-grotesk), sans-serif', letterSpacing: -0.11, color: '#26251e' }}>
                {termYr}-Jahres-Projektion{' '}
                <span style={{ color: 'rgba(38,37,30,0.4)', fontSize: 14 }}>+ {projYrs - termYr}-Jahres-Projektion</span>
              </h3>
              <div style={{ display: 'inline-flex', padding: 3, borderRadius: 9999, background: 'rgba(38,37,30,0.06)' }}>
                {([{ k: 'amort', label: 'Restschuld vs. Tilgung' }, { k: 'cashflow', label: 'Cashflow' }] as const).map((t) => (
                  <button key={t.k} onClick={() => setChart(t.k)} style={{ padding: '6px 14px', borderRadius: 9999, border: 'none', background: chart === t.k ? '#26251e' : 'transparent', color: chart === t.k ? '#f7f7f4' : 'rgba(38,37,30,0.65)', font: '500 12px var(--font-space-grotesk), sans-serif', cursor: 'pointer', transition: 'all 150ms ease' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {chart === 'cashflow' ? (
                <>
                  <LegendItem color="#1f8a65" label="Positiver Cashflow" />
                  <LegendItem color="#cf2d56" label="Negativer Cashflow" />
                  <span style={{ marginLeft: 'auto', font: '500 10.5px/1 var(--font-space-grotesk), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.45)' }}>
                    Kumuliert {rows.length}J ·{' '}
                    <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: (rows[rows.length - 1]?.cumCf ?? 0) >= 0 ? '#1f8a65' : '#cf2d56', textTransform: 'none', letterSpacing: 0 }}>
                      {fmtEUR(rows[rows.length - 1]?.cumCf ?? 0, { sign: true })}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <LegendItem color="#c0a8dd" label="Restschuld" />
                  <LegendItem color="#9fc9a2" label="Getilgt (kumuliert)" />
                  <span style={{ marginLeft: 'auto', font: '500 10.5px/1 var(--font-space-grotesk), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(38,37,30,0.45)' }}>
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
        </main>
      </div>
    </>
  )
}
