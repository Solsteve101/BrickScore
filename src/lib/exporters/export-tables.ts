import type { CalcInputs, CalcResult, ProjectionRow } from '../calculator-engine'
import { STATES } from '../calculator-engine'
import type { UsagePlan } from '../usage-store'
import { fmtEurDe, fmtPctDe, fmtNumDe } from './format-helpers'

export interface BuildPayload {
  titel: string
  link: string
  inputs: CalcInputs
  result: CalcResult
  projection: ProjectionRow[]
  termYr: number
  score?: number
  verdict?: string
  bilder?: string[]
  plan?: UsagePlan
}

/** Two-column key/value row used by Object/Finance/Cashflow/KPI tables. */
export interface KvRow {
  label: string
  value: string
  /** When true, render as a highlighted total / summary row. */
  total?: boolean
  /** Drives optional coloring in renderers (e.g. green/red for cashflow). */
  cashflowSign?: 'positive' | 'negative'
}

/** Three-column row for the "Kaufnebenkosten" table. */
export interface NkRow {
  position: string
  satz: string
  betrag: string
  total?: boolean
}

/** Five-column row for the multi-year projection table. */
export interface ProjectionTableRow {
  jahr: string
  restschuld: string
  tilgungKum: string
  jahresCf: string
  cfKum: string
}

const DASH = '—'

function bundeslandName(code: string): string {
  return STATES.find((s) => s.code === code)?.name ?? code ?? DASH
}

/**
 * Extract a portal-specific reference from a listing URL.
 * - ImmoScout24: "Scout-ID: <digits>"
 * - Immowelt:    "Immowelt-ID: <digits>"
 * - Other:       "Quelle: <hostname>"
 * Returns "" when the link is empty or unparseable.
 */
export function extractPortalRef(link: string): string {
  if (!link) return ''
  let url: URL
  try { url = new URL(link) } catch { return '' }
  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  const path = url.pathname

  if (host.includes('immobilienscout24') || host.includes('immoscout24')) {
    const match = path.match(/expose\/(\d+)/i)
    if (match) return `Scout-ID: ${match[1]}`
  }
  if (host.includes('immowelt') || host.includes('immonet')) {
    const match = path.match(/expose\/(\d+)/i) || path.match(/(\d{6,})/)
    if (match) return `Immowelt-ID: ${match[1]}`
  }
  return `Quelle: ${host}`
}

function pctRaw(value: number, decimals = 2): string {
  if (!isFinite(value)) return DASH
  return `${value.toFixed(decimals).replace('.', ',')} %`
}

function inputNum(v: string): number {
  const n = parseFloat(String(v).replace(',', '.'))
  return isFinite(n) ? n : 0
}

export function buildObjectTable(p: BuildPayload): KvRow[] {
  const r = p.result
  const standort = [p.inputs.city, bundeslandName(p.inputs.state)].filter(Boolean).join(', ')
  return [
    { label: 'Wohnfläche',     value: r.wohnflaeche > 0 ? `${fmtNumDe(r.wohnflaeche)} m²` : DASH },
    { label: 'Zimmer',         value: r.zimmer > 0 ? String(r.zimmer).replace('.', ',') : DASH },
    { label: 'Baujahr',        value: r.baujahr > 0 ? String(r.baujahr) : DASH },
    { label: 'Standort',       value: standort || DASH },
    { label: 'Kaufpreis',      value: fmtEurDe(r.price) },
    { label: 'Kaufpreis / m²', value: r.wohnflaeche > 0 ? fmtEurDe(r.pricePerSqm) : DASH },
  ]
}

export function buildNebenkostenTable(p: BuildPayload): NkRow[] {
  const r = p.result
  return [
    { position: 'Grunderwerbsteuer', satz: pctRaw(r.nkComps.grest),     betrag: fmtEurDe(r.price * r.nkComps.grest / 100) },
    { position: 'Notar',             satz: pctRaw(r.nkComps.notar),     betrag: fmtEurDe(r.price * r.nkComps.notar / 100) },
    { position: 'Grundbuch',         satz: pctRaw(r.nkComps.grundbuch), betrag: fmtEurDe(r.price * r.nkComps.grundbuch / 100) },
    { position: 'Makler',            satz: pctRaw(r.nkComps.makler),    betrag: fmtEurDe(r.price * r.nkComps.makler / 100) },
    { position: 'Nebenkosten gesamt', satz: pctRaw(r.nkPct),            betrag: fmtEurDe(r.nebenkosten), total: true },
  ]
}

export function buildFinanzierungTable(p: BuildPayload): KvRow[] {
  const r = p.result
  return [
    { label: 'Kaufpreis',       value: fmtEurDe(r.price) },
    { label: 'Nebenkosten',     value: fmtEurDe(r.nebenkosten) },
    { label: 'Renovierung',     value: fmtEurDe(r.reno) },
    { label: 'Gesamtkosten',    value: fmtEurDe(r.gesamt), total: true },
    { label: 'Eigenkapital',    value: fmtEurDe(r.equity) },
    { label: 'Darlehensbetrag', value: fmtEurDe(r.loan) },
    { label: 'Zinssatz',        value: `${String(p.inputs.rate).replace('.', ',')} % p.a.` },
    { label: 'Tilgung',         value: `${String(p.inputs.amort).replace('.', ',')} % p.a.` },
    { label: 'Laufzeit',        value: `${p.termYr} Jahre` },
    { label: 'Monatliche Rate', value: fmtEurDe(r.monthlyDebt) },
    { label: 'LTV',             value: fmtPctDe(r.ltv) },
  ]
}

export function buildCashflowTable(p: BuildPayload): KvRow[] {
  const r = p.result
  const vacancyPct = inputNum(p.inputs.vacancy)
  const vacancyAbs = (r.rent + r.otherInc) * (vacancyPct / 100)
  return [
    { label: 'Kaltmiete',           value: fmtEurDe(r.rent) },
    { label: 'Sonstige Einnahmen',  value: fmtEurDe(r.otherInc) },
    { label: `Leerstandsabzug (${vacancyPct.toString().replace('.', ',')} %)`, value: fmtEurDe(-vacancyAbs) },
    { label: 'Effektive Miete',     value: fmtEurDe(r.effectiveRentMon), total: true },
    { label: 'Laufende Kosten',     value: fmtEurDe(-r.opMon) },
    { label: 'Hausgeld',            value: fmtEurDe(-r.hausgeld) },
    { label: 'Kapitaldienst (Rate)',value: fmtEurDe(-r.monthlyDebt) },
    {
      label: 'Monatlicher Cashflow',
      value: fmtEurDe(r.monthlyCashflow, { sign: true }),
      total: true,
      cashflowSign: r.monthlyCashflow >= 0 ? 'positive' : 'negative',
    },
  ]
}

export function buildKpiTable(p: BuildPayload): KvRow[] {
  const r = p.result
  return [
    { label: 'Brutto-Mietrendite',  value: fmtPctDe(r.bruttoMietrendite) },
    { label: 'Netto-Rendite',       value: fmtPctDe(r.netYield) },
    { label: 'Cash-on-Cash Return', value: fmtPctDe(r.coc) },
    { label: 'Jahres-Cashflow',     value: fmtEurDe(r.annualCashflow, { sign: true }) },
    { label: 'Gesamtkosten / m²',   value: r.wohnflaeche > 0 ? fmtEurDe(r.totalCostPerSqm) : DASH },
  ]
}

export function buildProjectionTable(p: BuildPayload): ProjectionTableRow[] {
  // Match the loan term: only show as many years as the user-defined Laufzeit.
  const years = Math.max(1, Math.min(p.projection.length, p.termYr))
  return p.projection.slice(0, years).map((row) => ({
    jahr:       `J${row.year}`,
    restschuld: fmtEurDe(row.balance),
    tilgungKum: fmtEurDe(row.tilgungSum),
    jahresCf:   fmtEurDe(row.yearCf, { sign: true }),
    cfKum:      fmtEurDe(row.cumCf, { sign: true }),
  }))
}
