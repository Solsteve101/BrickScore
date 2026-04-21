export interface GermanState {
  code: string
  name: string
  grest: number
  makler: number
}

export interface NkOverrides {
  grest?: number
  notar?: number
  grundbuch?: number
  makler?: number
}

export interface NkComponents {
  grest: number
  notar: number
  grundbuch: number
  makler: number
}

export interface CalcInputs {
  listingUrl: string
  city: string
  state: string
  includeMakler: boolean
  nkOverrides: NkOverrides
  price: string
  reno: string
  opCosts: string
  equity: string
  rate: string
  amort: string
  term: string
  rent: string
  vacancy: string
  otherInc: string
}

export interface CalcResult {
  price: number
  nkPct: number
  nebenkosten: number
  nkComps: NkComponents
  reno: number
  gesamt: number
  equity: number
  loan: number
  rate: number
  amort: number
  annuity: number
  monthlyDebt: number
  monthlyInterest: number
  monthlyPrincipal: number
  rent: number
  otherInc: number
  vacancy: number
  effectiveRentMon: number
  effectiveRentYr: number
  opMon: number
  yearlyOp: number
  monthlyCashflow: number
  annualCashflow: number
  grossYield: number
  netYield: number
  coc: number
  ltv: number
}

export interface ProjectionRow {
  year: number
  balance: number
  yearInterest: number
  yearPrincipal: number
  yearCf: number
  cumCf: number
  tilgungSum: number
}

export type DealTone = 'good' | 'warn' | 'bad' | 'neutral'

export interface DealStateResult {
  tone: DealTone
  label: string
  blurb: string
}

export const STATES: GermanState[] = [
  { code: 'BE', name: 'Berlin',                 grest: 6.0, makler: 3.57 },
  { code: 'BW', name: 'Baden-Württemberg',      grest: 5.0, makler: 3.57 },
  { code: 'BY', name: 'Bayern',                 grest: 3.5, makler: 3.57 },
  { code: 'BB', name: 'Brandenburg',            grest: 6.5, makler: 3.57 },
  { code: 'HB', name: 'Bremen',                 grest: 5.0, makler: 3.57 },
  { code: 'HH', name: 'Hamburg',                grest: 5.5, makler: 3.57 },
  { code: 'HE', name: 'Hessen',                 grest: 6.0, makler: 3.57 },
  { code: 'MV', name: 'Mecklenburg-Vorpommern', grest: 6.0, makler: 3.57 },
  { code: 'NI', name: 'Niedersachsen',          grest: 5.0, makler: 3.57 },
  { code: 'NW', name: 'Nordrhein-Westfalen',    grest: 6.5, makler: 3.57 },
  { code: 'RP', name: 'Rheinland-Pfalz',        grest: 5.0, makler: 3.57 },
  { code: 'SL', name: 'Saarland',               grest: 6.5, makler: 3.57 },
  { code: 'SN', name: 'Sachsen',                grest: 5.5, makler: 3.57 },
  { code: 'ST', name: 'Sachsen-Anhalt',         grest: 5.0, makler: 3.57 },
  { code: 'SH', name: 'Schleswig-Holstein',     grest: 6.5, makler: 3.57 },
  { code: 'TH', name: 'Thüringen',              grest: 5.0, makler: 3.57 },
]

const NOTAR_DEFAULT = 1.5
const GRUNDBUCH_DEFAULT = 0.5

const stateByCode: Record<string, GermanState> = Object.fromEntries(STATES.map(s => [s.code, s]))

export function nkComponents(stateCode: string, includeMakler: boolean, overrides: NkOverrides = {}): NkComponents {
  const s = stateByCode[stateCode]
  const defaultGrest  = s ? s.grest  : 0
  const defaultMakler = s ? s.makler : 3.57
  return {
    grest:     overrides.grest     ?? defaultGrest,
    notar:     overrides.notar     ?? NOTAR_DEFAULT,
    grundbuch: overrides.grundbuch ?? GRUNDBUCH_DEFAULT,
    makler:    includeMakler ? (overrides.makler ?? defaultMakler) : 0,
  }
}

export function nkTotalPct(comps: NkComponents): number {
  return comps.grest + comps.notar + comps.grundbuch + comps.makler
}

export function calc(d: CalcInputs): CalcResult {
  const price  = +d.price  || 0
  const comps  = nkComponents(d.state, d.includeMakler, d.nkOverrides || {})
  const nkPct  = nkTotalPct(comps)
  const nebenkosten = price * nkPct / 100
  const reno   = +d.reno   || 0
  const opMon  = +d.opCosts || 0
  const gesamt = price + nebenkosten + reno

  const equity = +d.equity || 0
  const loan   = Math.max(0, gesamt - equity)
  const rate   = (+d.rate  || 0) / 100
  const amort  = (+d.amort || 0) / 100
  const annuity = loan * (rate + amort)
  const monthlyDebt = annuity / 12
  const monthlyInterest = loan * rate / 12
  const monthlyPrincipal = monthlyDebt - monthlyInterest

  const rent     = +d.rent     || 0
  const otherInc = +d.otherInc || 0
  const vacancy  = (+d.vacancy || 0) / 100
  const effectiveRentMon = (rent + otherInc) * (1 - vacancy)
  const effectiveRentYr  = effectiveRentMon * 12
  const yearlyOp = opMon * 12

  const monthlyCashflow = effectiveRentMon - opMon - monthlyDebt
  const annualCashflow  = monthlyCashflow * 12
  const grossYield = gesamt > 0 ? (rent * 12) / gesamt * 100 : 0
  const netYield   = gesamt > 0 ? (effectiveRentYr - yearlyOp) / gesamt * 100 : 0
  const coc        = equity > 0 ? annualCashflow / equity * 100 : 0
  const ltv        = price  > 0 ? loan / price * 100 : 0

  return {
    price, nkPct, nebenkosten, nkComps: comps, reno, gesamt,
    equity, loan, rate: rate * 100, amort: amort * 100, annuity,
    monthlyDebt, monthlyInterest, monthlyPrincipal,
    rent, otherInc, vacancy: vacancy * 100,
    effectiveRentMon, effectiveRentYr, opMon, yearlyOp,
    monthlyCashflow, annualCashflow,
    grossYield, netYield, coc, ltv,
  }
}

export function project10yr(r: CalcResult, years = 10): ProjectionRow[] {
  const rows: ProjectionRow[] = []
  const yrs = Math.max(1, Math.min(60, Math.round(isFinite(years) ? years : 10)))
  let balance = r.loan
  let cumCf = 0
  const monthRate = r.rate / 100 / 12
  for (let y = 1; y <= yrs; y++) {
    let yearInterest = 0
    let yearPrincipal = 0
    for (let m = 0; m < 12; m++) {
      const interest = balance * monthRate
      const principal = Math.min(balance, r.monthlyDebt - interest)
      balance = Math.max(0, balance - principal)
      yearInterest += interest
      yearPrincipal += principal
    }
    const yearCf = r.effectiveRentYr - r.yearlyOp - (yearInterest + yearPrincipal)
    cumCf += yearCf
    rows.push({ year: y, balance, yearInterest, yearPrincipal, yearCf, cumCf, tilgungSum: r.loan - balance })
  }
  return rows
}

export function fmtEUR(n: number, options: { sign?: boolean; decimals?: number } = {}): string {
  const { sign = false, decimals = 0 } = options
  if (!isFinite(n)) return '–'
  const abs = Math.abs(n)
  const fixed = decimals > 0 ? abs.toFixed(decimals) : Math.round(abs).toString()
  const [intPart, decPart] = fixed.split('.')
  const grouped = Number(intPart).toLocaleString('de-DE')
  const s = decPart ? `${grouped},${decPart}` : grouped
  const prefix = n < 0 ? '−' : sign && n > 0 ? '+' : ''
  return `${prefix}€${s}`
}

export function fmtPct(n: number, d = 1): string {
  return !isFinite(n) ? '–' : `${n.toFixed(d).replace('.', ',')} %`
}

export function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} Mio`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)} k`
  return Math.round(n).toString()
}

export function dealState(r: CalcResult, target = 5): DealStateResult {
  if (!isFinite(r.monthlyCashflow) || r.gesamt === 0) {
    return { tone: 'neutral', label: 'Kein Deal', blurb: 'Gib deine Zahlen ein, um eine Bewertung zu erhalten.' }
  }
  if (r.monthlyCashflow < 0) {
    return { tone: 'bad', label: 'Schwacher Deal', blurb: `Negativer Cashflow von ${fmtEUR(r.monthlyCashflow)} pro Monat.` }
  }
  if (r.netYield >= target && r.coc >= target) {
    return { tone: 'good', label: 'Starker Deal', blurb: `Netto-Rendite ${fmtPct(r.netYield)}, Cash-on-Cash ${fmtPct(r.coc)}.` }
  }
  return { tone: 'warn', label: 'Knapper Deal', blurb: `Positiver Cashflow, Netto-Rendite ${fmtPct(r.netYield)}.` }
}

export function dealScore(r: CalcResult): number {
  if (!isFinite(r.monthlyCashflow) || r.gesamt === 0) return 0
  const cf = Math.max(0, Math.min(1, r.monthlyCashflow / 800))
  const ny = Math.max(0, Math.min(1, r.netYield / 6))
  const cc = Math.max(0, Math.min(1, r.coc / 10))
  const lt = Math.max(0, Math.min(1, (90 - r.ltv) / 30))
  const raw = (cf * 0.35 + ny * 0.25 + cc * 0.3 + lt * 0.1) * 100
  return Math.round(Math.max(0, Math.min(100, raw)))
}
