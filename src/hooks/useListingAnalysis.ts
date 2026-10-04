import { useState } from 'react'
import { getUsage, hasTokens, showUsageToast, TOKEN_COST, type UsageAction } from '@/lib/usage-store'
import { pushToast } from '@/lib/toast'

export interface InsufficientTokensInfo {
  action: UsageAction
  required: number
  remaining: number
}

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
  usageToast?: 'empty' | 'low' | null
  remaining?: number
}

/** Thrown when the server rejects the analysis with 402 (not enough tokens). */
class InsufficientTokensError extends Error {
  readonly remaining: number
  constructor(remaining: number) {
    super('insufficient_tokens')
    this.remaining = remaining
    this.name = 'InsufficientTokensError'
  }
}

async function callApi(payload: { url: string } | { text: string }): Promise<ApiResponse> {
  const res = await fetch('/api/analyze-listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  })
  const json = await res.json() as ApiResponse
  if (res.status === 402) {
    throw new InsufficientTokensError(json.remaining ?? 0)
  }
  if (!res.ok || json.error) {
    throw new Error(json.message ?? json.error ?? `HTTP ${res.status}`)
  }
  return json
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
  const [insufficientTokens, setInsufficientTokens] = useState<InsufficientTokensInfo | null>(null)

  const analyze = async (payload: { url: string } | { text: string }): Promise<ListingData | null> => {
    const isUrl = 'url' in payload
    const action = isUrl ? 'link_analyse' : 'text_analyse'
    // Fast client-side pre-check for UX; the server enforces the limit authoritatively.
    if (!(await hasTokens(action))) {
      // Surface as a modal (handled by the caller) instead of inline error UI —
      // the user might still be able to fall back to manual text analysis.
      const usage = await getUsage()
      setInsufficientTokens({
        action,
        required: TOKEN_COST[action],
        remaining: usage.tokens_remaining,
      })
      return null
    }
    setStatus('loading')
    setData(null)
    setError(null)
    try {
      // The server checks and charges tokens; it only charges on a successful analysis.
      const { usageToast, ...result } = await callApi(payload)
      showUsageToast(usageToast)
      setData(result)
      setStatus('success')
      if (isUrl) {
        pushToast({
          variant: 'success',
          message: 'Inserat analysiert.',
        })
      }
      return result
    } catch (e) {
      if (e instanceof InsufficientTokensError) {
        setStatus('idle')
        setInsufficientTokens({ action, required: TOKEN_COST[action], remaining: e.remaining })
        return null
      }
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
    insufficientTokens,
    dismissInsufficient: () => setInsufficientTokens(null),
    analyzeListing: (url: string) => analyze({ url }),
    analyzeText: (text: string) => analyze({ text }),
    reset: () => {
      setStatus('idle')
      setData(null)
      setError(null)
      setInsufficientTokens(null)
    },
  }
}
