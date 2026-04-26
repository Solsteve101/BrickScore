export type ExportFormatKey = 'pdf' | 'xlsx' | 'png'

export interface SavedExport {
  export_id: string
  deal_id: string
  format: ExportFormatKey
  dateiname: string
  datum: string
  daten: string | null // base64 data URL, or null when file was too large to persist
}

const STORAGE_KEY = 'brickscore_exports'
const MAX_BASE64_BYTES = 2 * 1024 * 1024

function safeParse(raw: string | null): SavedExport[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as SavedExport[]) : []
  } catch {
    return []
  }
}

export function loadExports(): SavedExport[] {
  if (typeof window === 'undefined') return []
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

export function loadExportsForDeal(dealId: string): SavedExport[] {
  return loadExports()
    .filter((e) => e.deal_id === dealId)
    .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
}

export function countExportsByDeal(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const e of loadExports()) {
    out[e.deal_id] = (out[e.deal_id] ?? 0) + 1
  }
  return out
}

export function saveExport(entry: Omit<SavedExport, 'export_id' | 'datum'> & { datum?: string; export_id?: string }): SavedExport {
  if (typeof window === 'undefined') {
    return { ...entry, export_id: '', datum: new Date().toISOString() } as SavedExport
  }
  const all = loadExports()
  const created: SavedExport = {
    export_id: entry.export_id ?? makeId(),
    deal_id: entry.deal_id,
    format: entry.format,
    dateiname: entry.dateiname,
    datum: entry.datum ?? new Date().toISOString(),
    daten: entry.daten,
  }
  all.unshift(created)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // Quota exceeded — drop the oldest export with payload, retry
    const trimmed = trimToFit(all)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    } catch {
      // Last resort: store metadata only for the new entry
      created.daten = null
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([created, ...all.filter((e) => e.export_id !== created.export_id).map((e) => ({ ...e, daten: null }))]))
    }
  }
  return created
}

export function deleteExport(exportId: string): void {
  if (typeof window === 'undefined') return
  const all = loadExports().filter((e) => e.export_id !== exportId)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function deleteExportsForDeal(dealId: string): void {
  if (typeof window === 'undefined') return
  const all = loadExports().filter((e) => e.deal_id !== dealId)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function isWithinPersistLimit(byteLength: number): boolean {
  // base64 inflates raw bytes ~33%, leave headroom
  return byteLength <= MAX_BASE64_BYTES
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

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function trimToFit(all: SavedExport[]): SavedExport[] {
  // Drop payload from the oldest persisted exports (keep metadata) until under a heuristic ceiling
  const sorted = [...all].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].daten) {
      sorted[i] = { ...sorted[i], daten: null }
      try {
        // Test fit
        JSON.stringify(sorted)
        return sorted
      } catch {
        // ignore
      }
    }
  }
  return sorted
}
