import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CalcInputs, CalcResult, ProjectionRow } from '../calculator-engine'
import { STATES } from '../calculator-engine'
import { fmtEurDe, fmtPctDe, fmtNumDe, fmtDateDe, safeFilename } from './format-helpers'

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
}

const FOOTER_DISCLAIMER = 'Alle Berechnungen sind Richtwerte und keine Anlageberatung.'
const FOOTER_BRAND = 'BrickScore — brickscore.de'

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  doc.setDrawColor(220)
  doc.setLineWidth(0.3)
  doc.line(40, h - 38, w - 40, h - 38)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(120)
  doc.text(FOOTER_DISCLAIMER, 40, h - 24)
  doc.text(FOOTER_BRAND, w / 2, h - 24, { align: 'center' })
  doc.text(`Seite ${pageNum} / ${totalPages}`, w - 40, h - 24, { align: 'right' })
}

function drawLogo(doc: jsPDF, x: number, y: number) {
  // Simple stylized brick mark
  doc.setFillColor(10, 10, 10)
  doc.triangle(x, y + 14, x + 11, y + 4, x + 22, y + 14, 'F')
  doc.rect(x, y + 14, 22, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(10, 10, 10)
  doc.text('brickscore', x + 28, y + 14)
}

function bundeslandName(code: string): string {
  return STATES.find((s) => s.code === code)?.name ?? code ?? '—'
}

export interface ExportResult {
  blob: Blob
  filename: string
}

export async function exportPdf(payload: PdfPayload): Promise<ExportResult> {
  const { titel, link, bilder, inputs, result: r, projection, termYr, score, verdict } = payload
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()

  // ─── PAGE 1 — Cover ──────────────────────────────────────
  drawLogo(doc, 40, 50)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(10, 10, 10)
  doc.text(titel || 'Immobilien-Analyse', 40, 200, { maxWidth: w - 80 })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(80, 80, 80)
  const standortLine = [inputs.city, bundeslandName(inputs.state)].filter(Boolean).join(' · ')
  doc.text(standortLine || '—', 40, 230)

  doc.setFontSize(11)
  doc.setTextColor(120)
  doc.text(`Erstellt am ${fmtDateDe()}`, 40, 252)
  if (link) {
    doc.text('Link zum Inserat:', 40, 280)
    doc.setTextColor(60, 90, 200)
    doc.textWithLink(link, 40, 296, { url: link, maxWidth: w - 80 })
  }

  doc.setDrawColor(230)
  doc.setLineWidth(0.5)
  doc.line(40, 340, w - 40, 340)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(10, 10, 10)
  doc.text('Bewertung', 40, 370)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(60, 60, 60)
  doc.text(`${verdict}  ·  Deal-Score: ${score} / 100`, 40, 388)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(150)
  doc.text('Erstellt mit BrickScore — brickscore.de', 40, doc.internal.pageSize.getHeight() - 60)

  // ─── PAGE 2 — Objektübersicht ────────────────────────────
  doc.addPage()
  pageHeader(doc, 'Objektübersicht')

  autoTable(doc, {
    startY: 110,
    head: [['Position', 'Wert']],
    body: [
      ['Kaufpreis', fmtEurDe(r.price)],
      ['Wohnfläche', r.wohnflaeche > 0 ? `${fmtNumDe(r.wohnflaeche)} m²` : '—'],
      ['Zimmer', r.zimmer > 0 ? String(r.zimmer).replace('.', ',') : '—'],
      ['Baujahr', r.baujahr > 0 ? String(r.baujahr) : '—'],
      ['Standort', inputs.city || '—'],
      ['Bundesland', bundeslandName(inputs.state)],
      ['Kaufpreis / m²', r.wohnflaeche > 0 ? fmtEurDe(r.pricePerSqm) : '—'],
    ],
    styles: tableStyles(),
    headStyles: tableHeadStyles(),
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 40, right: 40 },
  })

  if (bilder.length > 0) {
    let y = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 110
    y += 26
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(10, 10, 10)
    doc.text('Objektbilder', 40, y)
    y += 12
    const imgW = 160, imgH = 110, gap = 12
    let x = 40
    for (const b of bilder.slice(0, 6)) {
      try {
        doc.addImage(b, 'JPEG', x, y, imgW, imgH, undefined, 'FAST')
      } catch {
        // skip invalid image
      }
      x += imgW + gap
      if (x + imgW > w - 40) { x = 40; y += imgH + gap }
    }
  }

  // ─── PAGE 3 — Finanzierung & Kosten ──────────────────────
  doc.addPage()
  pageHeader(doc, 'Finanzierung & Kosten')

  autoTable(doc, {
    startY: 110,
    head: [['Nebenkosten', 'Anteil', 'Betrag']],
    body: [
      ['Grunderwerbsteuer', `${r.nkComps.grest.toFixed(2).replace('.', ',')} %`, fmtEurDe(r.price * r.nkComps.grest / 100)],
      ['Notar', `${r.nkComps.notar.toFixed(2).replace('.', ',')} %`, fmtEurDe(r.price * r.nkComps.notar / 100)],
      ['Grundbuch', `${r.nkComps.grundbuch.toFixed(2).replace('.', ',')} %`, fmtEurDe(r.price * r.nkComps.grundbuch / 100)],
      ['Makler', `${r.nkComps.makler.toFixed(2).replace('.', ',')} %`, fmtEurDe(r.price * r.nkComps.makler / 100)],
      ['Summe Nebenkosten', `${r.nkPct.toFixed(2).replace('.', ',')} %`, fmtEurDe(r.nebenkosten)],
    ],
    styles: tableStyles(),
    headStyles: tableHeadStyles(),
    margin: { left: 40, right: 40 },
  })

  let y2 = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 110
  autoTable(doc, {
    startY: y2 + 22,
    head: [['Position', 'Wert']],
    body: [
      ['Kaufpreis', fmtEurDe(r.price)],
      ['Nebenkosten', fmtEurDe(r.nebenkosten)],
      ['Renovierung', fmtEurDe(r.reno)],
      ['Gesamtkosten', fmtEurDe(r.gesamt)],
      ['Eigenkapital', fmtEurDe(r.equity)],
      ['Darlehen', fmtEurDe(r.loan)],
      ['Zinssatz p. a.', `${String(inputs.rate).replace('.', ',')} %`],
      ['Tilgung p. a.', `${String(inputs.amort).replace('.', ',')} %`],
      ['Laufzeit', `${termYr} Jahre`],
      ['Monatsrate', fmtEurDe(r.monthlyDebt)],
      ['LTV', fmtPctDe(r.ltv)],
    ],
    styles: tableStyles(),
    headStyles: tableHeadStyles(),
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 40, right: 40 },
  })

  // ─── PAGE 4 — Rendite-Analyse ────────────────────────────
  doc.addPage()
  pageHeader(doc, 'Rendite-Analyse')

  autoTable(doc, {
    startY: 110,
    head: [['Kennzahl', 'Wert']],
    body: [
      ['Monats-Cashflow', fmtEurDe(r.monthlyCashflow, { sign: true })],
      ['Jahres-Cashflow', fmtEurDe(r.annualCashflow, { sign: true })],
      ['Netto-Rendite', fmtPctDe(r.netYield)],
      ['Cash-on-Cash', fmtPctDe(r.coc)],
      ['LTV', fmtPctDe(r.ltv)],
      ['Brutto-Mietrendite', fmtPctDe(r.bruttoMietrendite)],
      ['Gesamtkosten / m²', r.wohnflaeche > 0 ? fmtEurDe(r.totalCostPerSqm) : '—'],
      ['Deal-Score', `${score} / 100   (${verdict})`],
    ],
    styles: tableStyles(),
    headStyles: tableHeadStyles(),
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 40, right: 40 },
  })

  let y3 = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 110
  autoTable(doc, {
    startY: y3 + 22,
    head: [['Cashflow-Komponenten (monatlich)', 'Betrag']],
    body: [
      ['Effektive Miete', fmtEurDe(r.effectiveRentMon)],
      ['Laufende Kosten + Hausgeld', fmtEurDe(-r.totalOpMon)],
      ['Kapitaldienst (Zins + Tilgung)', fmtEurDe(-r.monthlyDebt)],
      ['Cashflow', fmtEurDe(r.monthlyCashflow, { sign: true })],
    ],
    styles: tableStyles(),
    headStyles: tableHeadStyles(),
    margin: { left: 40, right: 40 },
  })

  // ─── PAGE 5 — Cashflow-Projektion ────────────────────────
  doc.addPage()
  pageHeader(doc, `Projektion über ${projection.length} Jahre`)

  autoTable(doc, {
    startY: 110,
    head: [['Jahr', 'Restschuld', 'Getilgt', 'Jahres-Cashflow', 'Kumuliert']],
    body: projection.map((row) => [
      `J${row.year}`,
      fmtEurDe(row.balance),
      fmtEurDe(row.tilgungSum),
      fmtEurDe(row.yearCf, { sign: true }),
      fmtEurDe(row.cumCf, { sign: true }),
    ]),
    styles: tableStyles(),
    headStyles: tableHeadStyles(),
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 40, right: 40 },
  })

  let y5 = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 110
  const restschuldEnde = projection[Math.min(termYr, projection.length) - 1]?.balance ?? 0
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(10, 10, 10)
  doc.text(`Restschuld nach ${termYr} Jahren: ${fmtEurDe(restschuldEnde)}`, 40, y5 + 28)

  // ─── Footers ─────────────────────────────────────────────
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    addFooter(doc, i, total)
  }

  const filename = `${safeFilename(titel || 'BrickScore_Deal')}.pdf`
  const blob = doc.output('blob') as Blob
  return { blob, filename }
}

function pageHeader(doc: jsPDF, title: string) {
  drawLogo(doc, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(10, 10, 10)
  doc.text(title, 40, 90)
  doc.setDrawColor(230)
  doc.setLineWidth(0.5)
  doc.line(40, 98, doc.internal.pageSize.getWidth() - 40, 98)
}

function tableStyles() {
  return {
    font: 'helvetica' as const,
    fontSize: 10,
    cellPadding: 6,
    textColor: [38, 37, 30] as [number, number, number],
    lineColor: [220, 220, 220] as [number, number, number],
    lineWidth: 0.2,
  }
}

function tableHeadStyles() {
  return {
    fillColor: [28, 28, 28] as [number, number, number],
    textColor: [247, 247, 244] as [number, number, number],
    fontStyle: 'bold' as const,
    fontSize: 10,
  }
}
