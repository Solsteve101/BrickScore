import { prisma } from './prisma'
import {
  HISTORY_LIMIT,
  PLAN_MAX,
  TOKEN_COST,
  mondayOf,
  normalizeInterval,
  normalizePlan,
  type UsageAction,
  type UsageHistoryEntry,
  type UsagePlan,
  type BillingInterval,
  type UsageState,
} from './usage-shared'

interface UserUsageRow {
  id: string
  plan: string
  billingInterval: string | null
  tokensRemaining: number
  weekStart: string
  exportsCount: number
}

/**
 * Resets the user's weekly counters when the stored week is older than the
 * current Monday. Returns the (possibly updated) usage row. Does not append
 * history — week rollover is silent.
 */
async function rollWeekIfNeeded(user: UserUsageRow): Promise<UserUsageRow> {
  const currentMonday = mondayOf(new Date())
  if (user.weekStart === currentMonday) return user
  const plan = normalizePlan(user.plan)
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      weekStart: currentMonday,
      tokensRemaining: PLAN_MAX[plan],
      exportsCount: 0,
    },
    select: { id: true, plan: true, billingInterval: true, tokensRemaining: true, weekStart: true, exportsCount: true },
  })
  return updated
}

async function loadHistory(userId: string): Promise<UsageHistoryEntry[]> {
  const rows = await prisma.tokenUsage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_LIMIT,
  })
  return rows.map((r) => ({
    action: r.action as UsageAction,
    detail: r.description ?? undefined,
    tokens: r.tokens,
    date: r.createdAt.toISOString(),
  }))
}

function toUsageState(user: UserUsageRow, history: UsageHistoryEntry[]): UsageState {
  const plan = normalizePlan(user.plan)
  const max = PLAN_MAX[plan]
  return {
    tokens_remaining: Math.max(0, Math.min(user.tokensRemaining, max)),
    tokens_max: max,
    week_start: user.weekStart || mondayOf(new Date()),
    exports_count: user.exportsCount,
    plan,
    interval: normalizeInterval(user.billingInterval, plan),
    history,
  }
}

export async function getUsageForUser(userId: string): Promise<UsageState> {
  const row = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, plan: true, billingInterval: true, tokensRemaining: true, weekStart: true, exportsCount: true },
  })
  const rolled = await rollWeekIfNeeded(row)
  const history = await loadHistory(userId)
  return toUsageState(rolled, history)
}

export interface SpendResult {
  ok: boolean
  state: UsageState
  toast: 'empty' | 'low' | null
}

export async function spendTokensForUser(
  userId: string,
  action: UsageAction,
  detail?: string,
): Promise<SpendResult> {
  const row = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, plan: true, billingInterval: true, tokensRemaining: true, weekStart: true, exportsCount: true },
  })
  const rolled = await rollWeekIfNeeded(row)
  const cost = TOKEN_COST[action]
  if (rolled.tokensRemaining < cost) {
    const history = await loadHistory(userId)
    return { ok: false, state: toUsageState(rolled, history), toast: null }
  }

  const beforeRemaining = rolled.tokensRemaining
  const newRemaining = beforeRemaining - cost
  const newExports = action === 'export' ? rolled.exportsCount + 1 : rolled.exportsCount

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { tokensRemaining: newRemaining, exportsCount: newExports },
      select: { id: true, plan: true, billingInterval: true, tokensRemaining: true, weekStart: true, exportsCount: true },
    }),
    prisma.tokenUsage.create({
      data: { userId, action, description: detail ?? null, tokens: -cost },
    }),
  ])

  const max = PLAN_MAX[normalizePlan(updated.plan)]
  const threshold = max * 0.1
  let toast: 'empty' | 'low' | null = null
  if (beforeRemaining > 0 && updated.tokensRemaining === 0) {
    toast = 'empty'
  } else if (beforeRemaining > threshold && updated.tokensRemaining > 0 && updated.tokensRemaining <= threshold) {
    toast = 'low'
  }

  const history = await loadHistory(userId)
  return { ok: true, state: toUsageState(updated, history), toast }
}

export async function setPlanForUser(
  userId: string,
  plan: UsagePlan,
  interval: BillingInterval | null,
): Promise<UsageState> {
  const row = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, plan: true, billingInterval: true, tokensRemaining: true, weekStart: true, exportsCount: true },
  })
  const newMax = PLAN_MAX[plan]
  const previousMax = PLAN_MAX[normalizePlan(row.plan)]
  // Top up tokens to the new max only when upgrading to a higher cap.
  const tokensRemaining = newMax > previousMax ? newMax : Math.min(row.tokensRemaining, newMax)
  const finalInterval = plan === 'free' ? null : interval

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      billingInterval: finalInterval,
      tokensRemaining,
    },
    select: { id: true, plan: true, billingInterval: true, tokensRemaining: true, weekStart: true, exportsCount: true },
  })
  const history = await loadHistory(userId)
  return toUsageState(updated, history)
}
