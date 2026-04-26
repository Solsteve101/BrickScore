import html2canvas from 'html2canvas'
import { safeFilename } from './format-helpers'

export interface ExportResult {
  blob: Blob
  filename: string
}

export async function exportPng(targetId: string, titel: string): Promise<ExportResult> {
  const el = document.getElementById(targetId)
  if (!el) throw new Error('Export-Ziel nicht gefunden.')
  const canvas = await html2canvas(el, {
    backgroundColor: '#ffffff',
    scale: window.devicePixelRatio > 1 ? 2 : 1.5,
    logging: false,
    useCORS: true,
  })
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
  const filename = `${safeFilename(titel || 'BrickScore_Deal')}.png`
  return { blob, filename }
}
