import { pushToast } from './toast'

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
  /** Billing interval for paid plans. Null/undefined for free. */
  interval?: BillingInterval | null
  history: UsageHistoryEntry[]
}

export const TOKEN_COST: Record<UsageAction, number> = {
  link_analyse: 5,
  text_analyse: 3,
  manual_session: 1,
  export: 2,
}

const PLAN_MAX: Record<UsagePlan, number> = {
  free: 20,
  pro: 200,
  business: 600,
}

const STORAGE_KEY = 'brickscore_usage'
const HISTORY_LIMIT = 200

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Returns the Monday of the given date as YYYY-MM-DD. */
function mondayOf(d: Date): string {
  const day = d.getDay() // 0=Sun, 1=Mon, ...
  const diff = (day === 0 ? -6 : 1 - day)
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

function defaultState(plan: UsagePlan = 'free'): UsageState {
  const max = PLAN_MAX[plan]
  return {
    tokens_remaining: max,
    tokens_max: max,
    week_start: mondayOf(new Date()),
    exports_count: 0,
    plan,
    interval: null,
    history: [],
  }
}

function read(): UsageState {
  if (typeof window === 'undefined') return defaultState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const p = JSON.parse(raw) as Partial<UsageState>
    const plan: UsagePlan = p.plan === 'pro' || p.plan === 'business' ? p.plan : 'free'
    // Trust the canonical plan limit so existing users sync to the current PLAN_MAX
    // when limits change. Clamp tokens_remaining into the new range.
    const max = PLAN_MAX[plan]
    const storedRemaining = typeof p.tokens_remaining === 'number' ? p.tokens_remaining : max
    const tokensRemaining = Math.max(0, Math.min(storedRemaining, max))
    const storedInterval: BillingInterval | null = p.interval === 'monthly' || p.interval === 'yearly' ? p.interval : null
    // Legacy fallback: existing paid users without a stored interval default to 'monthly'
    const interval: BillingInterval | null = plan === 'free' ? null : (storedInterval ?? 'monthly')
    return {
      tokens_remaining: tokensRemaining,
      tokens_max: max,
      week_start: typeof p.week_start === 'string' ? p.week_start : mondayOf(new Date()),
      exports_count: typeof p.exports_count === 'number' ? p.exports_count : 0,
      plan,
      interval,
      history: Array.isArray(p.history) ? p.history as UsageHistoryEntry[] : [],
    }
  } catch {
    return defaultState()
  }
}

function write(s: UsageState): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

function rollWeekIfNeeded(s: UsageState): UsageState {
  const currentMonday = mondayOf(new Date())
  if (s.week_start === currentMonday) return s
  const next: UsageState = {
    ...s,
    week_start: currentMonday,
    tokens_remaining: s.tokens_max,
    exports_count: 0,
  }
  write(next)
  return next
}

export function getUsage(): UsageState {
  return rollWeekIfNeeded(read())
}

export function hasTokens(action: UsageAction): boolean {
  return getUsage().tokens_remaining >= TOKEN_COST[action]
}

/**
 * Spend tokens and append a history entry.
 * Returns the resulting state, or null if not enough tokens.
 */
export function spendTokens(action: UsageAction, detail?: string): UsageState | null {
  const u = getUsage()
  const cost = TOKEN_COST[action]
  if (u.tokens_remaining < cost) return null
  const entry: UsageHistoryEntry = {
    action,
    detail,
    tokens: -cost,
    date: new Date().toISOString(),
  }
  const history = [entry, ...u.history].slice(0, HISTORY_LIMIT)
  const next: UsageState = {
    ...u,
    tokens_remaining: u.tokens_remaining - cost,
    exports_count: action === 'export' ? u.exports_count + 1 : u.exports_count,
    history,
  }
  write(next)

  // Threshold toasts — fire only on the transitions, not on every spend.
  const threshold = next.tokens_max * 0.1
  if (next.tokens_remaining === 0 && u.tokens_remaining > 0) {
    pushToast({
      key: 'tokens-empty',
      variant: 'error',
      title: 'Keine Tokens mehr verfügbar',
      message: `Nächste Erneuerung am ${fmtNextResetLong()}.`,
      action: { label: 'Jetzt upgraden', href: '/dashboard/subscription' },
      persistent: true,
    })
  } else if (next.tokens_remaining > 0 && next.tokens_remaining <= threshold && u.tokens_remaining > threshold) {
    pushToast({
      key: 'tokens-low',
      variant: 'warning',
      title: 'Tokens fast aufgebraucht',
      message: `Noch ${next.tokens_remaining} von ${next.tokens_max} übrig. Nächste Erneuerung am ${fmtNextResetLong()}.`,
      action: { label: 'Upgrade auf Pro', href: '/dashboard/subscription' },
    })
  }

  return next
}

export function setPlan(plan: UsagePlan, interval: BillingInterval | null = null): UsageState {
  const u = getUsage()
  const max = PLAN_MAX[plan]
  // Top-up tokens to the new max only if upgrading to a higher cap
  const tokens_remaining = max > u.tokens_max ? max : Math.min(u.tokens_remaining, max)
  const next: UsageState = {
    ...u,
    plan,
    tokens_max: max,
    tokens_remaining,
    interval: plan === 'free' ? null : interval,
  }
  write(next)
  return next
}

export const FREE_TOKENS = PLAN_MAX.free
