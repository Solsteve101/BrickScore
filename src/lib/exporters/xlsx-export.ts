import XLSX from 'xlsx-js-style'
import type { CalcInputs, CalcResult, ProjectionRow } from '../calculator-engine'
import type { UsagePlan } from '../usage-store'
import { fmtDateDe, safeFilename } from './format-helpers'
import {
  buildObjectTable,
  buildNebenkostenTable,
  buildFinanzierungTable,
  buildCashflowTable,
  buildKpiTable,
  buildProjectionTable,
  extractPortalRef,
  type BuildPayload,
  type KvRow,
  type NkRow,
  type ProjectionTableRow,
} from './export-tables'

interface XlsxPayload {
  titel: string
  inputs: CalcInputs
  result: CalcResult
  projection: ProjectionRow[]
  termYr: number
  score: number
  verdict: string
  link?: string
  plan?: UsagePlan
}

export interface ExportResult {
  blob: Blob
  filename: string
}

// German number formats. xlsx-js-style honors these via cell.z.
// '#,##0' = thousands grouped (German Excel renders as #.##0).
const FMT_EUR = '#,##0 "€"'
// Literal "%" — store 6.5 → renders as 6,50%
const FMT_PCT = '0.00"%"'

// Brand colors (no leading hash)
const COLOR_HEADER_BG = '1C1C1C'
const COLOR_HEADER_FG = 'FFFFFF'
const COLOR_TOTAL_BG = 'EAEAE7'
const COLOR_ALT_BG = 'F5F5F3'
const COLOR_BORDER = 'E0E0E0'
const COLOR_GREEN = '1F8A65'
const COLOR_RED = 'CF2D56'
const COLOR_MUTED = '9A9A9A'

type StyleObj = {
  font?: { name?: string; sz?: number; bold?: boolean; color?: { rgb: string } }
  fill?: { patternType?: 'solid'; fgColor?: { rgb: string } }
  alignment?: { horizontal?: 'left' | 'right' | 'center'; vertical?: 'center' | 'top' | 'bottom' }
  border?: {
    top?: { style: 'thin'; color: { rgb: string } }
    bottom?: { style: 'thin'; color: { rgb: string } }
    left?: { style: 'thin'; color: { rgb: string } }
    right?: { style: 'thin'; color: { rgb: string } }
  }
  numFmt?: string
}

const FONT_BASE = { name: 'Calibri', sz: 10 }
const BORDER_THIN = {
  top:    { style: 'thin' as const, color: { rgb: COLOR_BORDER } },
  bottom: { style: 'thin' as const, color: { rgb: COLOR_BORDER } },
  left:   { style: 'thin' as const, color: { rgb: COLOR_BORDER } },
  right:  { style: 'thin' as const, color: { rgb: COLOR_BORDER } },
}

interface Cell {
  v: string | number
  t: 's' | 'n'
  z?: string
  s?: StyleObj
}

function s(v: string, style?: StyleObj): Cell { return { v, t: 's', s: style } }
function blank(style?: StyleObj): Cell { return { v: '', t: 's', s: style } }

// Strip "1.234 €" / "+12,5 %" / "—" → number | null
function parseGermanNumber(text: string): number | null {
  if (!text) return null
  const cleaned = text
    .replace(/€/g, '')
    .replace(/EUR/gi, '')
    .replace(/%/g, '')
    .replace(/[\s    ]/g, '')
    .trim()
  if (!cleaned || cleaned === '—' || cleaned === '-' || cleaned === '–') return null
  const sign = (cleaned.startsWith('-') || cleaned.startsWith('−')) ? -1 : 1
  const digits = cleaned.replace(/^[+\-−]/, '').replace(/\./g, '').replace(',', '.')
  const num = parseFloat(digits)
  return isFinite(num) ? sign * num : null
}

/**
 * Build a numeric cell from a formatted German string.
 * - "185.000 €" → number 185000 with FMT_EUR
 * - "6,50 %"      → number 0.065 with FMT_PCT (true Excel percent)
 * - other text    → string cell
 */
function valueCell(text: string, baseStyle: StyleObj, opts: { right?: boolean } = {}): Cell {
  const align = opts.right === false ? undefined : { horizontal: 'right' as const, vertical: 'center' as const }
  const style: StyleObj = align ? { ...baseStyle, alignment: align } : baseStyle

  const isEur = /€|EUR/i.test(text)
  const isPct = /%/.test(text)
  if (isEur || isPct) {
    const num = parseGermanNumber(text)
    if (num !== null) {
      return {
        v: num,
        t: 'n',
        z: isEur ? FMT_EUR : FMT_PCT,
        s: style,
      }
    }
  }
  return { v: text, t: 's', s: style }
}

// ─── Style presets ─────────────────────────────────────

const styleHeaderRow: StyleObj = {
  font: { ...FONT_BASE, bold: true, color: { rgb: COLOR_HEADER_FG } },
  fill: { patternType: 'solid', fgColor: { rgb: COLOR_HEADER_BG } },
  alignment: { horizontal: 'left', vertical: 'center' },
  border: BORDER_THIN,
}
const styleHeaderRowRight: StyleObj = {
  ...styleHeaderRow,
  alignment: { horizontal: 'right', vertical: 'center' },
}
const styleHeaderRowEmpty: StyleObj = {
  fill: { patternType: 'solid', fgColor: { rgb: COLOR_HEADER_BG } },
  border: BORDER_THIN,
}

function styleBodyLabel(alt: boolean): StyleObj {
  return {
    font: FONT_BASE,
    ...(alt ? { fill: { patternType: 'solid', fgColor: { rgb: COLOR_ALT_BG } } } : {}),
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER_THIN,
  }
}
function styleBodyValue(alt: boolean, opts: { bold?: boolean; color?: string } = {}): StyleObj {
  return {
    font: { ...FONT_BASE, bold: opts.bold, color: opts.color ? { rgb: opts.color } : undefined },
    ...(alt ? { fill: { patternType: 'solid', fgColor: { rgb: COLOR_ALT_BG } } } : {}),
    alignment: { horizontal: 'right', vertical: 'center' },
    border: BORDER_THIN,
  }
}
function styleBodyEmpty(alt: boolean): StyleObj {
  return {
    ...(alt ? { fill: { patternType: 'solid', fgColor: { rgb: COLOR_ALT_BG } } } : {}),
    border: BORDER_THIN,
  }
}
function styleTotalLabel(): StyleObj {
  return {
    font: { ...FONT_BASE, bold: true },
    fill: { patternType: 'solid', fgColor: { rgb: COLOR_TOTAL_BG } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER_THIN,
  }
}
function styleTotalValue(opts: { color?: string } = {}): StyleObj {
  return {
    font: { ...FONT_BASE, bold: true, color: opts.color ? { rgb: opts.color } : undefined },
    fill: { patternType: 'solid', fgColor: { rgb: COLOR_TOTAL_BG } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: BORDER_THIN,
  }
}
function styleTotalEmpty(): StyleObj {
  return {
    fill: { patternType: 'solid', fgColor: { rgb: COLOR_TOTAL_BG } },
    border: BORDER_THIN,
  }
}

// ─── Section builders (continuous, no spacers) ──────────

/** Section with NO column header — single header row spanning A:C. Data: label A, value B, C empty. */
function sectionLabelValue_AB(rows: Cell[][], title: string, items: KvRow[]): { mergeRow: number } {
  const headerRowIdx = rows.length
  rows.push([s(title, styleHeaderRow), blank(styleHeaderRowEmpty), blank(styleHeaderRowEmpty)])
  items.forEach((r, i) => {
    const alt = i % 2 === 1
    if (r.total) {
      rows.push([
        s(r.label, styleTotalLabel()),
        valueCell(r.value, styleTotalValue()),
        blank(styleTotalEmpty()),
      ])
    } else {
      rows.push([
        s(r.label, styleBodyLabel(alt)),
        valueCell(r.value, styleBodyValue(alt, { bold: true })),
        blank(styleBodyEmpty(alt)),
      ])
    }
  })
  return { mergeRow: headerRowIdx }
}

/** Section with single-column value in C. Header: TITLE | (empty) | rightLabel. */
function sectionLabelValue_AC(rows: Cell[][], title: string, rightLabel: string, items: KvRow[]): void {
  rows.push([s(title, styleHeaderRow), blank(styleHeaderRowEmpty), s(rightLabel, styleHeaderRowRight)])
  items.forEach((r, i) => {
    const alt = i % 2 === 1
    if (r.total) {
      const valStyle = r.cashflowSign
        ? styleTotalValue({ color: r.cashflowSign === 'positive' ? COLOR_GREEN : COLOR_RED })
        : styleTotalValue()
      rows.push([
        s(r.label, styleTotalLabel()),
        blank(styleTotalEmpty()),
        valueCell(r.value, valStyle),
      ])
    } else {
      rows.push([
        s(r.label, styleBodyLabel(alt)),
        blank(styleBodyEmpty(alt)),
        valueCell(r.value, styleBodyValue(alt, { bold: true })),
      ])
    }
  })
}

/** NK section: 3-col header & data — Position | Satz | Betrag. */
function sectionNK(rows: Cell[][], items: NkRow[]): void {
  rows.push([
    s('KAUFNEBENKOSTEN', styleHeaderRow),
    s('Satz',            styleHeaderRowRight),
    s('Betrag',          styleHeaderRowRight),
  ])
  items.forEach((r, i) => {
    const alt = i % 2 === 1
    if (r.total) {
      rows.push([
        s(r.position, styleTotalLabel()),
        valueCell(r.satz, styleTotalValue()),
        valueCell(r.betrag, styleTotalValue()),
      ])
    } else {
      rows.push([
        s(r.position, styleBodyLabel(alt)),
        valueCell(r.satz,   styleBodyValue(alt)),
        valueCell(r.betrag, styleBodyValue(alt, { bold: true })),
      ])
    }
  })
}

/** Projection: 5-col header & data. Padded with blanks in cols D/E for prior sections. */
function sectionProjection(rows: Cell[][], items: ProjectionTableRow[]): void {
  // Pad the existing rows so the sheet stays rectangular (5 cols)
  // Header
  rows.push([
    s('CASHFLOW-PROJEKTION', styleHeaderRow),
    s('Restschuld',          styleHeaderRowRight),
    s('Tilgung kum.',        styleHeaderRowRight),
    s('Jahres-CF',           styleHeaderRowRight),
    s('CF kum.',             styleHeaderRowRight),
  ])
  const lastIdx = items.length - 1
  items.forEach((r, i) => {
    const alt = i % 2 === 1
    const isLast = i === lastIdx
    const labelStyle = isLast
      ? styleTotalLabel()
      : { ...styleBodyLabel(alt), font: { ...FONT_BASE, bold: true } }
    const cellStyle = (color?: string): StyleObj =>
      isLast ? styleTotalValue({ color }) : styleBodyValue(alt, { color })

    const yearCfNum = parseGermanNumber(r.jahresCf)
    const cumCfNum  = parseGermanNumber(r.cfKum)
    const yearCfColor = yearCfNum !== null && yearCfNum < 0 ? COLOR_RED : undefined
    const cumCfColor  = cumCfNum  !== null && cumCfNum  < 0 ? COLOR_RED : undefined

    rows.push([
      s(r.jahr, labelStyle),
      valueCell(r.restschuld, cellStyle()),
      valueCell(r.tilgungKum, cellStyle()),
      valueCell(r.jahresCf,   cellStyle(yearCfColor)),
      valueCell(r.cfKum,      cellStyle(cumCfColor)),
    ])
  })
}

// ─── Workbook assembly ─────────────────────────────────

function applyHeaderFooter(ws: XLSX.WorkSheet, plan: UsagePlan): void {
  if (plan === 'business') return
  const text = plan === 'pro'
    ? 'Erstellt mit BrickScore'
    : 'BrickScore Free Version'
  ;(ws as XLSX.WorkSheet & { '!headerFooter'?: unknown })['!headerFooter'] = {
    oddHeader: `&R${text}`,
    oddFooter: `&LBrickScore — brickscore.de&RSeite &P von &N`,
  }
}

function aoaToSheet(rows: Cell[][]): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {} as XLSX.WorkSheet
  let maxC = 0
  rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      const addr = XLSX.utils.encode_cell({ r, c })
      const out: XLSX.CellObject = { v: cell.v as string | number, t: cell.t }
      if (cell.z) out.z = cell.z
      if (cell.s) (out as unknown as { s?: StyleObj }).s = cell.s
      ;(ws as Record<string, XLSX.CellObject>)[addr] = out
      if (c > maxC) maxC = c
    })
  })
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length - 1, c: maxC } })
  return ws
}

export function exportXlsx(payload: XlsxPayload): ExportResult {
  const plan: UsagePlan = payload.plan ?? 'free'
  const build: BuildPayload = {
    titel: payload.titel,
    link: payload.link ?? '',
    inputs: payload.inputs,
    result: payload.result,
    projection: payload.projection,
    termYr: payload.termYr,
    score: payload.score,
    verdict: payload.verdict,
    plan,
  }

  const portalRef = extractPortalRef(payload.link ?? '')
  const standortLine = build.inputs.city || ''
  const subParts = [payload.titel, standortLine, portalRef, fmtDateDe()].filter(Boolean)

  const titleStyle: StyleObj = { font: { ...FONT_BASE, sz: 14, bold: true } }
  const subStyle:   StyleObj = { font: { ...FONT_BASE, sz: 10 } }
  const linkStyle:  StyleObj = { font: { ...FONT_BASE, sz: 8, color: { rgb: COLOR_MUTED } } }
  const noteStyle:  StyleObj = { font: { ...FONT_BASE, sz: 8, color: { rgb: COLOR_MUTED } } }

  const rows: Cell[][] = []
  rows.push([s('Immobilien-Investment Analyse', titleStyle)])
  rows.push([s(subParts.join(' | '), subStyle)])
  if (payload.link) rows.push([s(payload.link, linkStyle)])
  rows.push([blank()]) // single spacer before the continuous table

  const merges: XLSX.Range[] = []
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } })
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 4 } })
  if (payload.link) merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: 4 } })

  // ── ONE continuous table — no spacer rows between sections ─────
  const objHeaderRow = rows.length
  sectionLabelValue_AB(rows, 'OBJEKTDATEN', buildObjectTable(build))
  // Merge the OBJEKTDATEN header A:C so it reads as one black bar.
  merges.push({ s: { r: objHeaderRow, c: 0 }, e: { r: objHeaderRow, c: 2 } })

  sectionNK(rows, buildNebenkostenTable(build))
  sectionLabelValue_AC(rows, 'FINANZIERUNG',                  'Betrag',   buildFinanzierungTable(build))
  sectionLabelValue_AC(rows, 'EINNAHMEN & AUSGABEN (MONATLICH)', 'Betrag', buildCashflowTable(build))
  sectionLabelValue_AC(rows, 'KENNZAHLEN',                    'Ergebnis', buildKpiTable(build))
  sectionProjection(rows, buildProjectionTable(build))

  // Two blank lines + disclaimer + copyright
  rows.push([blank()])
  rows.push([blank()])
  const year = new Date().getFullYear()
  rows.push([s('Dieses Dokument dient ausschließlich zu Informationszwecken und stellt keine Anlage-, Steuer- oder Rechtsberatung dar. Alle Berechnungen basieren auf den eingegebenen Daten und Annahmen. Keine Gewähr für Richtigkeit und Vollständigkeit.', noteStyle)])
  const copyrightLine = plan === 'business'
    ? `© ${year}`
    : `© ${year} BrickScore — brickscore.de`
  rows.push([s(copyrightLine, noteStyle)])

  // Pad shorter rows so the sheet is rectangular (5 cols total to match projection)
  const maxCols = 5
  for (const row of rows) {
    while (row.length < maxCols) row.push(blank())
  }

  const ws = aoaToSheet(rows)
  ws['!cols'] = [
    { wch: 40 }, // A — Position/Label (fits "Düsseldorf, Nordrhein-Westfalen")
    { wch: 20 }, // B — Wert / Satz / Restschuld
    { wch: 18 }, // C — Betrag / Tilgung kum.
    { wch: 18 }, // D — Jahres-CF
    { wch: 18 }, // E — CF kum.
  ]
  ws['!merges'] = merges
  applyHeaderFooter(ws, plan)

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Immobilien-Analyse')

  const filename = `${safeFilename(payload.titel || 'BrickScore_Deal')}.xlsx`
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  return { blob, filename }
}
