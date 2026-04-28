import html2canvas from 'html2canvas'
import type { CalcInputs, CalcResult } from '../calculator-engine'
import { STATES } from '../calculator-engine'
import type { UsagePlan } from '../usage-store'
import { fmtEurDe, fmtPctDe, fmtNumDe, fmtDateDe, safeFilename } from './format-helpers'

export interface ExportResult {
  blob: Blob
  filename: string
}

interface PngArgs {
  pngTargetId: string // kept for API compatibility; not used by the synthetic renderer
  titel: string
  inputs: CalcInputs
  result: CalcResult
  score: number
  verdict?: string
  link?: string
  plan: UsagePlan
}

const CARD_WIDTH = 1200
const CARD_HEIGHT = 800

// Brand palette
const COLOR_INK    = '#0a0a0a'
const COLOR_MUTED  = '#6F6F6F'
const COLOR_HEADER = '#1C1C1C'
const COLOR_ALT    = '#F5F5F3'
const COLOR_BORDER = '#E5E5E5'
const COLOR_RED    = '#DC2626'

function bundeslandName(code: string): string {
  return STATES.find((st) => st.code === code)?.name ?? code ?? ''
}

interface SectionRow {
  label: string
  value: string
  /** When true, render value in red (negative cashflow). */
  negative?: boolean
}

interface Section {
  title: string
  rows: SectionRow[]
}

function buildSections(args: PngArgs): Section[] {
  const r = args.result
  return [
    {
      title: 'OBJEKTDATEN',
      rows: [
        { label: 'Wohnfläche',     value: r.wohnflaeche > 0 ? `${fmtNumDe(r.wohnflaeche)} m²` : '—' },
        { label: 'Zimmer',         value: r.zimmer > 0 ? String(r.zimmer).replace('.', ',') : '—' },
        { label: 'Kaufpreis',      value: fmtEurDe(r.price) },
        { label: 'Kaufpreis/m²',   value: r.wohnflaeche > 0 ? fmtEurDe(r.pricePerSqm) : '—' },
      ],
    },
    {
      title: 'FINANZIERUNG',
      rows: [
        { label: 'Gesamtkosten',     value: fmtEurDe(r.gesamt) },
        { label: 'Eigenkapital',     value: fmtEurDe(r.equity) },
        { label: 'Darlehen',         value: fmtEurDe(r.loan) },
        { label: 'Monatliche Rate',  value: fmtEurDe(r.monthlyDebt) },
        { label: 'LTV',              value: fmtPctDe(r.ltv) },
      ],
    },
    {
      title: 'RENDITE',
      rows: [
        { label: 'Monats-Cashflow',    value: fmtEurDe(r.monthlyCashflow, { sign: true }), negative: r.monthlyCashflow < 0 },
        { label: 'Brutto-Mietrendite', value: fmtPctDe(r.bruttoMietrendite) },
        { label: 'Netto-Rendite',      value: fmtPctDe(r.netYield),                        negative: r.netYield < 0 },
        { label: 'Cash-on-Cash',       value: fmtPctDe(r.coc),                             negative: r.coc < 0 },
        { label: 'Jahres-Cashflow',    value: fmtEurDe(r.annualCashflow, { sign: true }),  negative: r.annualCashflow < 0 },
      ],
    },
  ]
}

/** Build the off-screen DOM card and render it via html2canvas. */
async function renderSummaryCard(args: PngArgs): Promise<HTMLCanvasElement> {
  const { titel, inputs, plan } = args
  const standort = [inputs.city, bundeslandName(inputs.state)].filter(Boolean).join(', ')
  const sections = buildSections(args)

  // Plan-driven branding fragments
  const cornerBrand = plan === 'business' ? '' : 'BrickScore'
  const watermark = plan === 'free' ? 'BrickScore — brickscore.de' : ''

  const root = document.createElement('div')
  root.style.position = 'fixed'
  root.style.top = '-10000px'
  root.style.left = '0'
  root.style.zIndex = '-1'
  root.style.pointerEvents = 'none'
  root.style.background = '#ffffff'
  root.style.width = `${CARD_WIDTH}px`
  root.style.height = `${CARD_HEIGHT}px`
  root.style.fontFamily = '"DM Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
  root.style.color = COLOR_INK
  root.style.boxSizing = 'border-box'
  root.style.padding = '40px 56px'

  const sectionsHtml = sections.map((sec) => {
    const headerHtml = `
      <tr>
        <th colspan="2" style="
          background:${COLOR_HEADER}; color:#FFFFFF;
          text-align:left; padding:0 16px;
          height:28px;
          font-size:11px; font-weight:700;
          letter-spacing:0.6px; text-transform:uppercase;
          border:1px solid ${COLOR_HEADER};">
          ${escapeHtml(sec.title)}
        </th>
      </tr>`
    const rowsHtml = sec.rows.map((r, i) => {
      const altBg = i % 2 === 1 ? COLOR_ALT : '#FFFFFF'
      const valColor = r.negative ? COLOR_RED : COLOR_INK
      return `
        <tr style="background:${altBg}; height:32px;">
          <td style="
            padding:0 16px; font-size:13px; color:${COLOR_INK};
            border:1px solid ${COLOR_BORDER};
            white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${escapeHtml(r.label)}
          </td>
          <td style="
            padding:0 16px; font-size:13px; font-weight:600;
            color:${valColor}; text-align:right;
            font-variant-numeric:tabular-nums;
            border:1px solid ${COLOR_BORDER};
            white-space:nowrap;">
            ${escapeHtml(r.value)}
          </td>
        </tr>`
    }).join('')
    return headerHtml + rowsHtml
  }).join('')

  const disclaimerLine =
    'Dieses Dokument dient ausschließlich zu Informationszwecken und stellt keine Anlage-, Steuer- oder Rechtsberatung dar.'
  const year = new Date().getFullYear()
  const copyrightLine = plan === 'business' ? `© ${year}` : `© ${year} BrickScore — brickscore.de`

  root.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; position:relative;">
      <!-- Top bar: brand + date -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:6px; border-bottom:1px solid ${COLOR_BORDER};">
        <div style="display:inline-flex; align-items:center; gap:10px;">
          <svg viewBox="0 0 332 249" width="19" height="14" aria-hidden="true" style="display:block;">
            <rect x="0" y="172" width="57" height="76" fill="${COLOR_INK}" />
            <path d="M0 166.122V172.245L57.29 185L128 138.571L84.129 110L0 166.122Z" fill="${COLOR_INK}" />
            <path d="M1.5 56V111L84 56L277 184.5V248.5H332V166L84 0L1.5 56Z" fill="${COLOR_INK}" />
          </svg>
          <span style="font-weight:600; font-size:18px; letter-spacing:-0.4px;">brickscore</span>
        </div>
        <span style="font-size:12px; color:${COLOR_MUTED};">${escapeHtml(fmtDateDe())}</span>
      </div>

      <!-- Title block -->
      <div style="margin-top:20px;">
        <div style="font-weight:700; font-size:16pt; line-height:1.2; letter-spacing:-0.3px; color:${COLOR_INK};">
          ${escapeHtml(titel || 'Immobilien-Investment Analyse')}
        </div>
        ${standort ? `<div style="margin-top:4px; font-size:12pt; color:${COLOR_MUTED};">${escapeHtml(standort)}</div>` : ''}
      </div>

      <!-- Sectioned table -->
      <div style="margin-top:20px;">
        <table style="
          width:100%; border-collapse:collapse;
          font-family:inherit; table-layout:fixed;">
          <colgroup>
            <col style="width:62%;" />
            <col style="width:38%;" />
          </colgroup>
          <tbody>
            ${sectionsHtml}
          </tbody>
        </table>
      </div>

      <!-- Footer: disclaimer + branding -->
      <div style="margin-top:auto; padding-top:16px;">
        <div style="font-size:9px; color:${COLOR_MUTED}; line-height:1.5;">
          ${escapeHtml(disclaimerLine)}
        </div>
        <div style="
          margin-top:6px;
          display:flex; justify-content:space-between; align-items:center;
          font-size:9px; color:${COLOR_MUTED};">
          <span>${escapeHtml(copyrightLine)}</span>
          ${cornerBrand ? `<span style="${plan === 'pro' ? 'opacity:0.7;' : ''}">${escapeHtml(plan === 'pro' ? 'Erstellt mit BrickScore' : cornerBrand)}</span>` : ''}
        </div>
      </div>

      <!-- Diagonal watermark for Free -->
      ${watermark ? `
        <div style="
          position:absolute; inset:0;
          display:flex; align-items:center; justify-content:center;
          pointer-events:none; opacity:0.10;
          transform:rotate(-30deg);
          font-weight:700; font-size:84px; color:#7a7a7a;
          white-space:nowrap;">
          ${escapeHtml(watermark)}
        </div>` : ''}
    </div>
  `

  document.body.appendChild(root)
  try {
    const canvas = await html2canvas(root, {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
    })
    return canvas
  } finally {
    document.body.removeChild(root)
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function exportPng(args: PngArgs): Promise<ExportResult> {
  const canvas = await renderSummaryCard(args)
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
  const filename = `${safeFilename(args.titel || 'BrickScore_Deal')}.png`
  return { blob, filename }
}
