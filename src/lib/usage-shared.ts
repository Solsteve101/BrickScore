// Shared constants and pure helpers used by both the client store and the
// server-side API routes. Kept free of `window`, Prisma, or other side-effects.

export type UsageAction =
  | 'link_analyse'
  | 'text_analyse'
  | 'manual_session'
  | 'export'

export interface UsageHistoryEntry {
  action: UsageAction
  detail?: string
  tokens: number // negative number, e.g. -5
  date: string // ISO timestamp
}

export type UsagePlan = 'free' | 'pro' | 'business'

export type BillingInterval = 'monthly' | 'yearly'

export interface UsageState {
  tokens_remaining: number
  tokens_max: number
  week_start: string // YYYY-MM-DD (Monday of current week)
  exports_count: number
  plan: UsagePlan
  interval?: BillingInterval | null
  history: UsageHistoryEntry[]
}

export const TOKEN_COST: Record<UsageAction, number> = {
  link_analyse: 5,
  text_analyse: 3,
  manual_session: 1,
  export: 2,
}

export const PLAN_MAX: Record<UsagePlan, number> = {
  free: 30,
  pro: 120,
  business: 300,
}

export const HISTORY_LIMIT = 200

export const FREE_TOKENS = PLAN_MAX.free

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Returns the Monday of the given date as YYYY-MM-DD. */
export function mondayOf(d: Date): string {
  const day = d.getDay() // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  m.setHours(0, 0, 0, 0)
  return `${m.getFullYear()}-${pad2(m.getMonth() + 1)}-${pad2(m.getDate())}`
}

/** Returns the next Monday at 00:00 (the moment tokens reset). */
export function nextResetDate(from: Date = new Date()): Date {
  const d = new Date(from)
  const day = d.getDay()
  const diffToCurrentMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToCurrentMonday)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 7)
  return d
}

/** "Montag, 05.05.2026, 00:00 Uhr" */
export function fmtNextResetLong(d: Date = nextResetDate()): string {
  const date = d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  return `${date}, ${time} Uhr`
}

export function normalizePlan(p: unknown): UsagePlan {
  return p === 'pro' || p === 'business' ? p : 'free'
}

export function normalizeInterval(i: unknown, plan: UsagePlan): BillingInterval | null {
  if (plan === 'free') return null
  if (i === 'monthly' || i === 'yearly') return i
  return 'monthly' // legacy fallback for paid users with missing interval
}
