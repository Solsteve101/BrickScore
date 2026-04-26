import * as XLSX from 'xlsx'
import type { CalcInputs, CalcResult, ProjectionRow } from '../calculator-engine'
import { STATES } from '../calculator-engine'
import { safeFilename } from './format-helpers'

interface XlsxPayload {
  titel: string
  inputs: CalcInputs
  result: CalcResult
  projection: ProjectionRow[]
  termYr: number
  score: number
  verdict: string
}

function bundeslandName(code: string): string {
  return STATES.find((s) => s.code === code)?.name ?? code ?? '—'
}

export interface ExportResult {
  blob: Blob
  filename: string
}

export function exportXlsx(payload: XlsxPayload): ExportResult {
  const { titel, inputs, result: r, projection, termYr, score, verdict } = payload
  const wb = XLSX.utils.book_new()

  // Sheet 1 — Übersicht
  const uebersicht: (string | number)[][] = [
    ['BrickScore — Deal-Analyse'],
    ['Titel', titel || 'Immobilien-Analyse'],
    ['Erstellt am', new Date().toLocaleString('de-DE')],
    [],
    ['Objektdaten'],
    ['Kaufpreis (EUR)', Math.round(r.price)],
    ['Wohnfläche (m²)', r.wohnflaeche],
    ['Zimmer', r.zimmer],
    ['Baujahr', r.baujahr || ''],
    ['Standort', inputs.city || ''],
    ['Bundesland', bundeslandName(inputs.state)],
    [],
    ['KPIs'],
    ['Monats-Cashflow (EUR)', Math.round(r.monthlyCashflow)],
    ['Jahres-Cashflow (EUR)', Math.round(r.annualCashflow)],
    ['Netto-Rendite (%)', Number(r.netYield.toFixed(2))],
    ['Cash-on-Cash (%)', Number(r.coc.toFixed(2))],
    ['LTV (%)', Number(r.ltv.toFixed(2))],
    ['Brutto-Mietrendite (%)', Number(r.bruttoMietrendite.toFixed(2))],
    ['Kaufpreis / m² (EUR)', Math.round(r.pricePerSqm)],
    ['Gesamtkosten / m² (EUR)', Math.round(r.totalCostPerSqm)],
    ['Deal-Score', score],
    ['Bewertung', verdict],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(uebersicht)
  ws1['!cols'] = [{ wch: 30 }, { wch: 22 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Übersicht')

  // Sheet 2 — Finanzierung
  const finanzierung: (string | number)[][] = [
    ['Nebenkosten (Aufschlüsselung)'],
    ['Position', 'Anteil (%)', 'Betrag (EUR)'],
    ['Grunderwerbsteuer', Number(r.nkComps.grest.toFixed(2)), Math.round(r.price * r.nkComps.grest / 100)],
    ['Notar', Number(r.nkComps.notar.toFixed(2)), Math.round(r.price * r.nkComps.notar / 100)],
    ['Grundbuch', Number(r.nkComps.grundbuch.toFixed(2)), Math.round(r.price * r.nkComps.grundbuch / 100)],
    ['Makler', Number(r.nkComps.makler.toFixed(2)), Math.round(r.price * r.nkComps.makler / 100)],
    ['Summe', Number(r.nkPct.toFixed(2)), Math.round(r.nebenkosten)],
    [],
    ['Darlehen & Rate'],
    ['Kaufpreis (EUR)', Math.round(r.price)],
    ['Renovierung (EUR)', Math.round(r.reno)],
    ['Gesamtkosten (EUR)', Math.round(r.gesamt)],
    ['Eigenkapital (EUR)', Math.round(r.equity)],
    ['Darlehen (EUR)', Math.round(r.loan)],
    ['Zinssatz (%)', Number(String(inputs.rate).replace(',', '.'))],
    ['Tilgung (%)', Number(String(inputs.amort).replace(',', '.'))],
    ['Laufzeit (Jahre)', termYr],
    ['Monatsrate (EUR)', Math.round(r.monthlyDebt)],
    [],
    ['Laufende Position (monatlich)'],
    ['Effektive Miete (EUR)', Math.round(r.effectiveRentMon)],
    ['Laufende Kosten (EUR)', Math.round(r.opMon)],
    ['Hausgeld (EUR)', Math.round(r.hausgeld)],
    ['Gesamtkosten Betrieb (EUR)', Math.round(r.totalOpMon)],
    ['Cashflow (EUR)', Math.round(r.monthlyCashflow)],
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(finanzierung)
  ws2['!cols'] = [{ wch: 32 }, { wch: 14 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Finanzierung')

  // Sheet 3 — Projektion
  const projHeader: (string | number)[][] = [
    ['Jahr', 'Restschuld (EUR)', 'Zins (Jahr)', 'Tilgung (Jahr)', 'Getilgt kumuliert', 'Jahres-Cashflow', 'Cashflow kumuliert'],
  ]
  const projRows = projection.map((row) => [
    row.year,
    Math.round(row.balance),
    Math.round(row.yearInterest),
    Math.round(row.yearPrincipal),
    Math.round(row.tilgungSum),
    Math.round(row.yearCf),
    Math.round(row.cumCf),
  ])
  const ws3 = XLSX.utils.aoa_to_sheet([...projHeader, ...projRows])
  ws3['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'Projektion')

  const filename = `${safeFilename(titel || 'BrickScore_Deal')}.xlsx`
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  return { blob, filename }
}
