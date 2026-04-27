import html2canvas from 'html2canvas'
import { safeFilename } from './format-helpers'
import type { UsagePlan } from '../usage-store'

export interface ExportResult {
  blob: Blob
  filename: string
}

const BANNER_HEIGHT = 56
const CORNER_PAD = 18

export async function exportPng(targetId: string, titel: string, plan: UsagePlan = 'free'): Promise<ExportResult> {
  const el = document.getElementById(targetId)
  if (!el) throw new Error('Export-Ziel nicht gefunden.')
  const baseCanvas = await html2canvas(el, {
    backgroundColor: '#ffffff',
    scale: window.devicePixelRatio > 1 ? 2 : 1.5,
    logging: false,
    useCORS: true,
  })

  const finalCanvas = applyPlanBranding(baseCanvas, plan)

  const blob: Blob = await new Promise((resolve, reject) => {
    finalCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
  const filename = `${safeFilename(titel || 'BrickScore_Deal')}.png`
  return { blob, filename }
}

function applyPlanBranding(src: HTMLCanvasElement, plan: UsagePlan): HTMLCanvasElement {
  if (plan === 'business') return src

  if (plan === 'free') {
    const out = document.createElement('canvas')
    const scale = src.width / Math.max(1, src.width) // preserve resolution
    void scale
    out.width = src.width
    out.height = src.height + BANNER_HEIGHT
    const ctx = out.getContext('2d')
    if (!ctx) return src
    // Banner
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, out.width, BANNER_HEIGHT)
    ctx.fillStyle = '#ffffff'
    const fontSize = Math.round(BANNER_HEIGHT * 0.42)
    ctx.font = `600 ${fontSize}px "DM Sans", system-ui, sans-serif`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText('Erstellt mit BrickScore — brickscore.de', out.width / 2, BANNER_HEIGHT / 2)
    ctx.drawImage(src, 0, BANNER_HEIGHT)
    return out
  }

  // pro: small "BrickScore" bottom-right at 40% opacity
  const out = document.createElement('canvas')
  out.width = src.width
  out.height = src.height
  const ctx = out.getContext('2d')
  if (!ctx) return src
  ctx.drawImage(src, 0, 0)
  ctx.globalAlpha = 0.4
  ctx.fillStyle = '#0a0a0a'
  const fontSize = Math.max(14, Math.round(src.width * 0.013))
  ctx.font = `500 ${fontSize}px "DM Sans", system-ui, sans-serif`
  ctx.textBaseline = 'bottom'
  ctx.textAlign = 'right'
  ctx.fillText('BrickScore', out.width - CORNER_PAD, out.height - CORNER_PAD)
  ctx.globalAlpha = 1
  return out
}
