import { pushToast } from './toast'
import {
  PLAN_MAX,
  TOKEN_COST,
  fmtNextResetLong,
  nextResetDate,
  normalizeInterval,
  normalizePlan,
  type BillingInterval,
  type UsageAction,
  type UsageHistoryEntry,
  type UsagePlan,
  type UsageState,
} from './usage-shared'

// Re-export the public surface so existing imports keep working unchanged.
export {
  PLAN_MAX,
  TOKEN_COST,
  FREE_TOKENS,
  fmtNextResetLong,
  nextResetDate,
} from './usage-shared'
export type {
  UsageAction,
  UsageHistoryEntry,
  UsagePlan,
  BillingInterval,
  UsageState,
} from './usage-shared'

function defaultState(plan: UsagePlan = 'free'): UsageState {
  const max = PLAN_MAX[plan]
  return {
    tokens_remaining: max,
    tokens_max: max,
    week_start: '',
    exports_count: 0,
    plan,
    interval: null,
    history: [],
  }
}

interface SpendResponse {
  ok: boolean
  state: UsageState
  toast: 'empty' | 'low' | null
}

export async function getUsage(): Promise<UsageState> {
  if (typeof window === 'undefined') return defaultState()
  try {
    const res = await fetch('/api/usage', { cache: 'no-store' })
    if (!res.ok) return defaultState()
    const json = (await res.json()) as Partial<UsageState>
    return {
      tokens_remaining: typeof json.tokens_remaining === 'number' ? json.tokens_remaining : 0,
      tokens_max: typeof json.tokens_max === 'number' ? json.tokens_max : PLAN_MAX.free,
      week_start: typeof json.week_start === 'string' ? json.week_start : '',
      exports_count: typeof json.exports_count === 'number' ? json.exports_count : 0,
      plan: normalizePlan(json.plan),
      interval: normalizeInterval(json.interval, normalizePlan(json.plan)),
      history: Array.isArray(json.history) ? json.history as UsageHistoryEntry[] : [],
    }
  } catch {
    return defaultState()
  }
}

export async function hasTokens(action: UsageAction): Promise<boolean> {
  const u = await getUsage()
  return u.tokens_remaining >= TOKEN_COST[action]
}

/**
 * Spend tokens and append a history entry.
 * Returns the resulting state, or null if not enough tokens.
 */
export async function spendTokens(action: UsageAction, detail?: string): Promise<UsageState | null> {
  if (typeof window === 'undefined') return null
  try {
    const res = await fetch('/api/usage/spend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, detail }),
    })
    const json = (await res.json()) as SpendResponse
    if (!json.ok) return null
    if (json.toast === 'empty') {
      pushToast({
        key: 'tokens-empty',
        variant: 'error',
        title: 'Nutzungslimit erreicht',
        message: `Erneuert sich am ${fmtNextResetLong()}.`,
        action: { label: 'Jetzt upgraden', href: '/dashboard/subscription' },
        persistent: true,
      })
    } else if (json.toast === 'low') {
      pushToast({
        key: 'tokens-low',
        variant: 'warning',
        title: 'Limit fast erreicht',
        message: `Du hast diese Woche schon einen großen Teil deines Limits genutzt. Erneuert sich am ${fmtNextResetLong()}.`,
        action: { label: 'Upgrade auf Pro', href: '/dashboard/subscription' },
        persistent: true,
      })
    }
    return json.state
  } catch {
    return null
  }
}

export async function setPlan(plan: UsagePlan, interval: BillingInterval | null = null): Promise<UsageState> {
  if (typeof window === 'undefined') return defaultState(plan)
  try {
    const res = await fetch('/api/usage/plan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, interval }),
    })
    if (!res.ok) return defaultState(plan)
    return (await res.json()) as UsageState
  } catch {
    return defaultState(plan)
  }
}

