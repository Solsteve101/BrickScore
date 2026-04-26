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

const STORAGE_KEY = 'brickscore_deals_v1'

function safeParse(raw: string | null): SavedDeal[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed as SavedDeal[] : []
  } catch {
    return []
  }
}

export function loadDeals(): SavedDeal[] {
  if (typeof window === 'undefined') return []
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

export function saveDeal(deal: SavedDeal): void {
  if (typeof window === 'undefined') return
  const all = loadDeals()
  all.unshift(deal)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function findDealById(id: string): SavedDeal | null {
  return loadDeals().find((d) => d.id === id) ?? null
}

export function deleteDeal(id: string): void {
  if (typeof window === 'undefined') return
  const all = loadDeals().filter((d) => d.id !== id)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
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
