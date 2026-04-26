export function fmtEurDe(n: number, opts: { sign?: boolean } = {}): string {
  if (!isFinite(n)) return '–'
  const sign = opts.sign && n > 0 ? '+' : n < 0 ? '−' : ''
  const abs = Math.abs(Math.round(n))
  return `${sign}${abs.toLocaleString('de-DE')} EUR`
}

export function fmtPctDe(n: number, d = 1): string {
  if (!isFinite(n)) return '–'
  return `${n.toFixed(d).replace('.', ',')} %`
}

export function fmtNumDe(n: number): string {
  if (!isFinite(n)) return '–'
  return Math.round(n).toLocaleString('de-DE')
}

export function fmtDateDe(iso?: string): string {
  const d = iso ? new Date(iso) : new Date()
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function safeFilename(s: string, fallback = 'BrickScore_Deal'): string {
  const cleaned = (s || fallback)
    .normalize('NFKD')
    .replace(/[^\w\s.-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
  return cleaned || fallback
}
