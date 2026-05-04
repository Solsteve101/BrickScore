import type { CalcInputs, CalcResult } from './calculator-engine'

export interface SavedDeal {
  id: string
  titel: string
  link: string
  notizen: string
  bilder: string[] // base64 data URLs
  datum: string // ISO timestamp
  inputs: CalcInputs
  kpis: {
    monatsCashflow: number
    jahresCashflow: number
    nettoRendite: number
    cashOnCash: number
    ltv: number
    dealScore: number
    kaufpreisProQm: number
    bruttoMietrendite: number
    gesamtkostenProQm: number
  }
}

export async function loadDeals(): Promise<SavedDeal[]> {
  if (typeof window === 'undefined') return []
  try {
    const res = await fetch('/api/deals', { cache: 'no-store' })
    if (!res.ok) return []
    return (await res.json()) as SavedDeal[]
  } catch {
    return []
  }
}

export async function saveDeal(deal: SavedDeal): Promise<SavedDeal | null> {
  if (typeof window === 'undefined') return null
  try {
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deal),
    })
    if (!res.ok) return null
    return (await res.json()) as SavedDeal
  } catch {
    return null
  }
}

export async function findDealById(id: string): Promise<SavedDeal | null> {
  if (typeof window === 'undefined') return null
  try {
    const res = await fetch(`/api/deals/${encodeURIComponent(id)}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as SavedDeal
  } catch {
    return null
  }
}

/** Replace an existing deal in place, preserving id and original creation date. */
export async function updateDeal(id: string, patch: Partial<Omit<SavedDeal, 'id'>>): Promise<SavedDeal | null> {
  if (typeof window === 'undefined') return null
  try {
    const res = await fetch(`/api/deals/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) return null
    return (await res.json()) as SavedDeal
  } catch {
    return null
  }
}

export async function deleteDeal(id: string): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    await fetch(`/api/deals/${encodeURIComponent(id)}`, { method: 'DELETE' })
  } catch {
    /* ignore */
  }
}

export function buildKpis(r: CalcResult, score: number): SavedDeal['kpis'] {
  return {
    monatsCashflow: r.monthlyCashflow,
    jahresCashflow: r.annualCashflow,
    nettoRendite: r.netYield,
    cashOnCash: r.coc,
    ltv: r.ltv,
    dealScore: score,
    kaufpreisProQm: r.pricePerSqm,
    bruttoMietrendite: r.bruttoMietrendite,
    gesamtkostenProQm: r.totalCostPerSqm,
  }
}
