import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CalcInputs, CalcResult, ProjectionRow } from '../calculator-engine'
import { STATES } from '../calculator-engine'
import type { UsagePlan } from '../usage-store'
import { fmtDateDe, safeFilename } from './format-helpers'
import {
  buildObjectTable,
  buildNebenkostenTable,
  buildFinanzierungTable,
  buildCashflowTable,
  buildKpiTable,
  buildProjectionTable,
  extractPortalRef as _extractPortalRef,
  type BuildPayload,
  type KvRow,
  type NkRow,
  type ProjectionTableRow,
} from './export-tables'

// Re-export for callers that imported it from pdf-export.
export const extractPortalRef = _extractPortalRef

interface PdfPayload {
  titel: string
  link: string
  bilder: string[]
  inputs: CalcInputs
  result: CalcResult
  projection: ProjectionRow[]
  termYr: number
  score: number
  verdict: string
  plan?: UsagePlan
}

export interface ExportResult {
  blob: Blob
  filename: string
}

// ─── Layout (A4 in points; 20mm horizontal, 15mm vertical) ──
const M_X = 57
const M_TOP = 43
const M_BOT = 43

const FOOTER_DISCLAIMER = 'Richtwerte — keine Anlageberatung'
const FOOTER_BRAND = 'BrickScore — brickscore.de'

// Brand palette
const COLOR_INK: [number, number, number] = [10, 10, 10]
const COLOR_HEADER_BG: [number, number, number] = [28, 28, 28]
const COLOR_HEADER_FG: [number, number, number] = [247, 247, 244]
const COLOR_BODY: [number, number, number] = [38, 37, 30]
const COLOR_MUTED: [number, number, number] = [120, 120, 120]
const COLOR_LIGHT_LINE: [number, number, number] = [220, 220, 220]
const COLOR_ALT_ROW: [number, number, number] = [245, 245, 243]
const COLOR_TOTAL_ROW: [number, number, number] = [234, 234, 231]

const COLOR_GREEN: [number, number, number] = [31, 138, 101]
const COLOR_RED: [number, number, number] = [207, 45, 86]

// ─── jsPDF / WinAnsi safety ──────────────────────────────
// jsPDF's built-in Helvetica is a WinAnsi Type1 font. Codepoints outside that
// range (U+2212 minus, U+202F narrow NBSP, U+00A0 NBSP, U+2009 thin space, …)
// render as broken `&`-prefixed strings. Sanitize every string we hand to jsPDF.
function s(input: string | number): string {
  const str = typeof input === 'number' ? String(input) : input
  return str
    // Non-WinAnsi spaces → ASCII space:
    // U+00A0 NBSP, U+2000-U+200A widths, U+202F narrow NBSP,
    // U+205F medium math space, U+3000 ideographic, U+200B ZWSP, U+2060 word joiner
    .replace(/[  -​  　⁠]/g, ' ')
    // Dash variants → ASCII '-':
    // U+2010..U+2015 hyphen/en-dash/em-dash family, U+2212 Unicode minus
    .replace(/[‐-―−]/g, '-')
}

function bundeslandName(code: string): string {
  return STATES.find((st) => st.code === code)?.name ?? code ?? '—'
}

// ─── Drawing helpers ─────────────────────────────────────

// Renders the BrickScore brand mark from public/logo.svg (viewBox 332×249).
// Three filled shapes: a foreground rect, a small "shadow" polygon, and the
// rooftop polygon. We translate every absolute coordinate from the SVG
// coordinate system into the target box (W × H) at (x, y).
function drawLogo(doc: jsPDF, x: number, y: number) {
  const H = 10
  const W = (H * 332) / 249
  // Draw the icon offset down so its bottom aligns with the text baseline at y+14
  const yTop = y + 4
  const sx = W / 332
  const sy = H / 249
  const tx = (px: number) => x + px * sx
  const ty = (py: number) => yTop + py * sy

  doc.setFillColor(...COLOR_INK)

  // Shape 1: foreground block. Rect: x=0, y=172, w=57, h=76
  doc.rect(tx(0), ty(172), 57 * sx, 76 * sy, 'F')

  // Shape 2: small bridge polygon
  drawPoly(doc, [
    [tx(0), ty(166.122)],
    [tx(0), ty(172.245)],
    [tx(57.29), ty(185)],
    [tx(128), ty(138.571)],
    [tx(84.129), ty(110)],
  ])

  // Shape 3: roof polygon
  drawPoly(doc, [
    [tx(1.5), ty(56)],
    [tx(1.5), ty(111)],
    [tx(84), ty(56)],
    [tx(277), ty(184.5)],
    [tx(277), ty(248.5)],
    [tx(332), ty(248.5)],
    [tx(332), ty(166)],
    [tx(84), ty(0)],
  ])

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...COLOR_INK)
  doc.text(s('brickscore'), x + W + 3, y + 14)
}

function drawPoly(doc: jsPDF, abs: Array<[number, number]>) {
  if (abs.length < 2) return
  const [x0, y0] = abs[0]
  const segs: Array<[number, number]> = []
  for (let i = 1; i < abs.length; i++) {
    segs.push([abs[i][0] - abs[i - 1][0], abs[i][1] - abs[i - 1][1]])
  }
  doc.lines(segs, x0, y0, [1, 1], 'F', true)
}

function setOpacity(doc: jsPDF, opacity: number): boolean {
  const state = doc as unknown as {
    GState?: new (opts: { opacity: number }) => unknown
    setGState?: (gs: unknown) => void
  }
  if (typeof state.GState === 'function' && typeof state.setGState === 'function') {
    state.setGState(new state.GState({ opacity }))
    return true
  }
  return false
}

function addDiagonalWatermark(doc: jsPDF) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  const restored = setOpacity(doc, 0.12)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(56)
  doc.setTextColor(120, 120, 120)
  doc.text(s('BrickScore - brickscore.de'), w / 2, h / 2, { align: 'center', angle: 45 })
  if (restored) setOpacity(doc, 1)
  doc.setTextColor(...COLOR_INK)
}

function pageHeader(doc: jsPDF, title: string, plan: UsagePlan, opts: { showDate?: boolean } = {}) {
  const w = doc.internal.pageSize.getWidth()
  if (plan !== 'business') drawLogo(doc, M_X, M_TOP)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...COLOR_INK)
  doc.text(s(title), w / 2, M_TOP + 14, { align: 'center' })

  if (opts.showDate) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(s(fmtDateDe()), w - M_X, M_TOP + 14, { align: 'right' })
  }

  doc.setDrawColor(...COLOR_LIGHT_LINE)
  doc.setLineWidth(0.5)
  doc.line(M_X, M_TOP + 28, w - M_X, M_TOP + 28)
  doc.setTextColor(...COLOR_INK)
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number, plan: UsagePlan) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  const baseY = h - M_BOT + 14
  doc.setDrawColor(...COLOR_LIGHT_LINE)
  doc.setLineWidth(0.3)
  doc.line(M_X, h - M_BOT, w - M_X, h - M_BOT)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...COLOR_MUTED)
  doc.text(s(FOOTER_DISCLAIMER), M_X, baseY)
  if (plan !== 'business') {
    doc.text(s(FOOTER_BRAND), w / 2, baseY, { align: 'center' })
  }
  doc.text(s(`Seite ${pageNum} / ${totalPages}`), w - M_X, baseY, { align: 'right' })
  doc.setTextColor(...COLOR_INK)
}

function tableStyles() {
  return {
    font: 'helvetica' as const,
    fontSize: 10,
    cellPadding: 4,
    textColor: COLOR_BODY,
    lineColor: [228, 228, 224] as [number, number, number],
    lineWidth: 0.2,
    valign: 'middle' as const,
    overflow: 'linebreak' as const,
  }
}

function tableHeadStyles() {
  return {
    fillColor: COLOR_HEADER_BG,
    textColor: COLOR_HEADER_FG,
    fontStyle: 'bold' as const,
    fontSize: 10,
    cellPadding: 5,
  }
}

function getLastY(doc: jsPDF, fallback: number): number {
  return (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? fallback
}

// ─── Shared table renderers ──────────────────────────────

function renderKvTable(
  doc: jsPDF,
  startY: number,
  headerLabel: string,
  rows: KvRow[],
  valueHeader: string = 'Wert',
): void {
  const totalIdxs = new Set<number>()
  const cashflowColors = new Map<number, [number, number, number]>()
  rows.forEach((r, i) => {
    if (r.total) totalIdxs.add(i)
    if (r.cashflowSign) cashflowColors.set(i, r.cashflowSign === 'positive' ? COLOR_GREEN : COLOR_RED)
  })

  autoTable(doc, {
    startY,
    head: [[s(headerLabel), s(valueHeader)]],
    body: rows.map((r) => [s(r.label), s(r.value)]),
    styles: tableStyles(),
    headStyles: tableHeadStyles(),
    alternateRowStyles: { fillColor: COLOR_ALT_ROW },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' as const } },
    margin: { left: M_X, right: M_X },
    didParseCell: (hook) => {
      if (hook.section !== 'body') return
      if (totalIdxs.has(hook.row.index)) {
        hook.cell.styles.fontStyle = 'bold'
        hook.cell.styles.fillColor = COLOR_TOTAL_ROW
      }
      const cfColor = cashflowColors.get(hook.row.index)
      if (cfColor && hook.column.index === 1) {
        hook.cell.styles.textColor = cfColor
      }
    },
  })
}

function renderNkTable(doc: jsPDF, startY: number, rows: NkRow[]): void {
  const totalIdxs = new Set<number>()
  rows.forEach((r, i) => { if (r.total) totalIdxs.add(i) })

  autoTable(doc, {
    startY,
    head: [[s('Kaufnebenkosten'), s('Satz'), s('Betrag')]],
    body: rows.map((r) => [s(r.position), s(r.satz), s(r.betrag)]),
    styles: tableStyles(),
    headStyles: tableHeadStyles(),
    alternateRowStyles: { fillColor: COLOR_ALT_ROW },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right', fontStyle: 'bold' as const },
    },
    margin: { left: M_X, right: M_X },
    didParseCell: (hook) => {
      if (hook.section === 'body' && totalIdxs.has(hook.row.index)) {
        hook.cell.styles.fontStyle = 'bold'
        hook.cell.styles.fillColor = COLOR_TOTAL_ROW
      }
    },
  })
}

function renderProjectionAutotable(doc: jsPDF, startY: number, rows: ProjectionTableRow[]): void {
  const lastIdx = rows.length - 1
  autoTable(doc, {
    startY,
    head: [[s('Jahr'), s('Restschuld'), s('Tilgung kum.'), s('Jahres-Cashflow'), s('Cashflow kum.')]],
    body: rows.map((r) => [s(r.jahr), s(r.restschuld), s(r.tilgungKum), s(r.jahresCf), s(r.cfKum)]),
    styles: tableStyles(),
    headStyles: tableHeadStyles(),
    alternateRowStyles: { fillColor: COLOR_ALT_ROW },
    columnStyles: {
      0: { fontStyle: 'bold' as const },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: M_X, right: M_X },
    didParseCell: (hook) => {
      if (hook.section === 'body' && hook.row.index === lastIdx) {
        hook.cell.styles.fontStyle = 'bold'
        hook.cell.styles.fillColor = COLOR_TOTAL_ROW
      }
    },
  })
}

// ─── PAGE 1 — Objektdaten & Kosten ──────────────────────

function renderObjektUndKosten(doc: jsPDF, payload: PdfPayload, build: BuildPayload) {
  const { titel, link, inputs, plan = 'free' } = payload
  pageHeader(doc, 'Immobilien-Investment Analyse', plan, { showDate: true })

  const w = doc.internal.pageSize.getWidth()
  let y = M_TOP + 50

  // Compact info line: "Titel | Standort | Portal-ID"
  const standort = [inputs.city, bundeslandName(inputs.state)].filter(Boolean).join(', ')
  const portalRef = extractPortalRef(link)
  const infoParts = [titel, standort, portalRef].filter(Boolean)
  if (infoParts.length > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...COLOR_INK)
    const infoLine = infoParts.join(' | ')
    const wrapped = doc.splitTextToSize(s(infoLine), w - 2 * M_X)
    doc.text(wrapped, M_X, y)
    y += 14 * wrapped.length
  }

  // Full link in 8pt grey for digital reference
  if (link) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_MUTED)
    doc.textWithLink(s(link), M_X, y, { url: link, maxWidth: w - 2 * M_X })
    doc.setTextColor(...COLOR_INK)
    y += 12
  }
  y += 6

  // Tables
  renderKvTable(doc, y, 'Objektdaten', buildObjectTable(build))
  renderNkTable(doc, getLastY(doc, y) + 14, buildNebenkostenTable(build))
  renderKvTable(doc, getLastY(doc, y) + 14, 'Finanzierung', buildFinanzierungTable(build), 'Betrag')
}

// ─── PAGE 2 — Renditeanalyse ────────────────────────────

function renderRendite(doc: jsPDF, payload: PdfPayload, build: BuildPayload) {
  const plan: UsagePlan = payload.plan ?? 'free'
  pageHeader(doc, 'Renditeanalyse', plan)

  renderKvTable(doc, M_TOP + 50, 'Monatliche Einnahmen & Ausgaben', buildCashflowTable(build), 'Betrag')
  renderKvTable(doc, getLastY(doc, M_TOP + 50) + 14, 'Kennzahlen', buildKpiTable(build), 'Ergebnis')
}

// ─── PAGE 3 — Cashflow-Projektion ───────────────────────

function renderProjektion(doc: jsPDF, payload: PdfPayload, build: BuildPayload) {
  const plan: UsagePlan = payload.plan ?? 'free'
  pageHeader(doc, 'Cashflow-Projektion', plan)

  renderProjectionAutotable(doc, M_TOP + 50, buildProjectionTable(build))

  // Disclaimer (no box, two lines, 8pt grey)
  const w = doc.internal.pageSize.getWidth()
  const usableW = w - 2 * M_X
  const year = new Date().getFullYear()
  const startY = getLastY(doc, M_TOP + 50) + 22

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...COLOR_MUTED)
  const disclaimer = s('Dieses Dokument dient ausschließlich zu Informationszwecken und stellt keine Anlage-, Steuer- oder Rechtsberatung dar. Alle Berechnungen basieren auf den eingegebenen Daten und Annahmen. Keine Gewähr für Richtigkeit und Vollständigkeit.')
  const lines = doc.splitTextToSize(disclaimer, usableW)
  doc.text(lines, M_X, startY)

  const copyrightLine = plan === 'business'
    ? s(`© ${year}`)
    : s(`© ${year} BrickScore - brickscore.de`)
  doc.text(copyrightLine, M_X, startY + lines.length * 10 + 4)
  doc.setTextColor(...COLOR_INK)
}

// ─── ENTRY ───────────────────────────────────────────────

export async function exportPdf(payload: PdfPayload): Promise<ExportResult> {
  const plan: UsagePlan = payload.plan ?? 'free'
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const build: BuildPayload = {
    titel: payload.titel,
    link: payload.link,
    inputs: payload.inputs,
    result: payload.result,
    projection: payload.projection,
    termYr: payload.termYr,
    score: payload.score,
    verdict: payload.verdict,
    bilder: payload.bilder,
    plan,
  }

  // Page 1
  renderObjektUndKosten(doc, payload, build)
  // Page 2
  doc.addPage()
  renderRendite(doc, payload, build)
  // Page 3
  doc.addPage()
  renderProjektion(doc, payload, build)

  // Watermark + Footer pass
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    if (plan === 'free') addDiagonalWatermark(doc)
    addFooter(doc, i, total, plan)
  }

  const filename = `${safeFilename(payload.titel || 'BrickScore_Deal')}.pdf`
  const blob = doc.output('blob') as Blob
  return { blob, filename }
}
