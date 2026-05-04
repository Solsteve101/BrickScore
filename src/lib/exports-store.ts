export type ExportFormatKey = 'pdf' | 'xlsx' | 'png'

export interface SavedExport {
  export_id: string
  deal_id: string
  format: ExportFormatKey
  dateiname: string
  datum: string
  daten: string | null // base64 data URL, or null when file was too large to persist
}

// Cap the payload we send over the network. Postgres TEXT can hold much more,
// but a 5MB POST body is a reasonable browser/server safety limit.
const MAX_PERSIST_BYTES = 5 * 1024 * 1024

export async function loadExports(): Promise<SavedExport[]> {
  if (typeof window === 'undefined') return []
  try {
    const res = await fetch('/api/exports', { cache: 'no-store' })
    if (!res.ok) return []
    return (await res.json()) as SavedExport[]
  } catch {
    return []
  }
}

export async function loadExportsForDeal(dealId: string): Promise<SavedExport[]> {
  if (typeof window === 'undefined') return []
  try {
    const res = await fetch(`/api/exports?dealId=${encodeURIComponent(dealId)}`, { cache: 'no-store' })
    if (!res.ok) return []
    return (await res.json()) as SavedExport[]
  } catch {
    return []
  }
}

export async function countExportsByDeal(): Promise<Record<string, number>> {
  const all = await loadExports()
  const out: Record<string, number> = {}
  for (const e of all) {
    if (!e.deal_id) continue
    out[e.deal_id] = (out[e.deal_id] ?? 0) + 1
  }
  return out
}

export async function saveExport(entry: {
  deal_id: string | null
  format: ExportFormatKey
  dateiname: string
  daten: string | null
}): Promise<SavedExport | null> {
  if (typeof window === 'undefined') return null
  try {
    const res = await fetch('/api/exports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
    if (!res.ok) return null
    return (await res.json()) as SavedExport
  } catch {
    return null
  }
}

export async function deleteExport(exportId: string): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    await fetch(`/api/exports/${encodeURIComponent(exportId)}`, { method: 'DELETE' })
  } catch {
    /* ignore */
  }
}

export async function deleteExportsForDeal(dealId: string): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    await fetch(`/api/exports?dealId=${encodeURIComponent(dealId)}`, { method: 'DELETE' })
  } catch {
    /* ignore */
  }
}

export function isWithinPersistLimit(byteLength: number): boolean {
  return byteLength <= MAX_PERSIST_BYTES
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('read_failed'))
    reader.readAsDataURL(blob)
  })
}

export function base64ToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',')
  const mime = /data:([^;]+);base64/.exec(meta)?.[1] ?? 'application/octet-stream'
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
