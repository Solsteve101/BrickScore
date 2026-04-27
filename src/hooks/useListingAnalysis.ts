import { useState } from 'react'
import { hasTokens, spendTokens, TOKEN_COST } from '@/lib/usage-store'
import { pushToast } from '@/lib/toast'

export interface ListingData {
  kaufpreis: number | null
  wohnflaeche: number | null
  zimmer: number | null
  baujahr: number | null
  plz: string | null
  ort: string | null
  bundesland: string | null
  bundeslandCode: string | null
  objektart: string | null
  zustand: string | null
  hausgeld: number | null
  monthlyRent: number | null
  grestPct: number | null
  hatMakler: boolean | null
}

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error'

interface ApiResponse extends ListingData {
  error?: string
  message?: string
}

async function callApi(payload: { url: string } | { text: string }): Promise<ListingData> {
  const res = await fetch('/api/analyze-listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  })
  const json = await res.json() as ApiResponse
  if (!res.ok || json.error) {
    throw new Error(json.message ?? json.error ?? `HTTP ${res.status}`)
  }
  return json
}

function hostFromUrl(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'Inserat' }
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) {
    if (e.name === 'TimeoutError') return 'Analyse hat zu lange gedauert. Bitte Text manuell einfügen.'
    if (e.name === 'AbortError') return 'Analyse wurde abgebrochen.'
    return e.message
  }
  return 'Unbekannter Fehler'
}

export function useListingAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [data, setData] = useState<ListingData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (payload: { url: string } | { text: string }): Promise<ListingData | null> => {
    const isUrl = 'url' in payload
    const action = isUrl ? 'link_analyse' : 'text_analyse'
    if (!hasTokens(action)) {
      const cost = TOKEN_COST[action]
      setError(`Nicht genug Tokens (${cost} benötigt). Warte bis Montag oder upgrade auf Pro.`)
      setStatus('error')
      return null
    }
    setStatus('loading')
    setData(null)
    setError(null)
    try {
      const result = await callApi(payload)
      // Charge tokens only on a successful analysis
      const detail = isUrl ? hostFromUrl((payload as { url: string }).url) : 'Text-Paste'
      spendTokens(action, detail)
      setData(result)
      setStatus('success')
      if (isUrl) {
        pushToast({
          variant: 'success',
          message: `Inserat analysiert — ${TOKEN_COST[action]} Tokens verbraucht.`,
        })
      }
      return result
    } catch (e) {
      const msg = errorMessage(e)
      setError(msg)
      setStatus('error')
      if (isUrl) {
        pushToast({
          variant: 'error',
          message: 'Inserat konnte nicht geladen werden. Versuche den Text-Import.',
        })
      }
      return null
    }
  }

  return {
    status,
    data,
    error,
    analyzeListing: (url: string) => analyze({ url }),
    analyzeText: (text: string) => analyze({ text }),
    reset: () => {
      setStatus('idle')
      setData(null)
      setError(null)
    },
  }
}
