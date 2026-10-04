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

const USAGE_SELECT = {
  id: true,
  plan: true,
  billingInterval: true,
  tokensRemaining: true,
  weekStart: true,
  exportsCount: true,
} as const

/**
 * Resets the user's weekly counters when the stored week is older than the
 * current Monday. Returns the (possibly updated) usage row. Does not append
 * history — week rollover is silent. The reset is conditional on weekStart so
 * concurrent requests can't reset twice and wipe a spend in between.
 */
async function rollWeekIfNeeded(user: UserUsageRow): Promise<UserUsageRow> {
  const currentMonday = mondayOf(new Date())
  if (user.weekStart === currentMonday) return user
  const plan = normalizePlan(user.plan)
  await prisma.user.updateMany({
    where: { id: user.id, weekStart: { not: currentMonday } },
    data: {
      weekStart: currentMonday,
      tokensRemaining: PLAN_MAX[plan],
      exportsCount: 0,
    },
  })
  return prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: USAGE_SELECT })
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
  const rolled = await loadRolledUsageRow(userId)
  const history = await loadHistory(userId)
  return toUsageState(rolled, history)
}

export interface SpendResult {
  ok: boolean
  state: UsageState
  toast: 'empty' | 'low' | null
}

async function loadRolledUsageRow(userId: string): Promise<UserUsageRow> {
  const row = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: USAGE_SELECT })
  return rollWeekIfNeeded(row)
}

/** Read-only check whether the user can currently afford the action. */
export async function checkTokensForUser(
  userId: string,
  action: UsageAction,
): Promise<{ ok: boolean; state: UsageState }> {
  const rolled = await loadRolledUsageRow(userId)
  const history = await loadHistory(userId)
  return { ok: rolled.tokensRemaining >= TOKEN_COST[action], state: toUsageState(rolled, history) }
}

export async function spendTokensForUser(
  userId: string,
  action: UsageAction,
  detail?: string,
): Promise<SpendResult> {
  await loadRolledUsageRow(userId)
  const cost = TOKEN_COST[action]

  // Atomic: the decrement only applies while enough tokens are left, so
  // concurrent requests can never push the balance below zero.
  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.user.updateMany({
      where: { id: userId, tokensRemaining: { gte: cost } },
      data: {
        tokensRemaining: { decrement: cost },
        ...(action === 'export' ? { exportsCount: { increment: 1 } } : {}),
      },
    })
    if (res.count === 0) return null
    await tx.tokenUsage.create({
      data: { userId, action, description: detail ?? null, tokens: -cost },
    })
    return tx.user.findUniqueOrThrow({ where: { id: userId }, select: USAGE_SELECT })
  })

  if (!updated) {
    const current = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: USAGE_SELECT })
    const history = await loadHistory(userId)
    return { ok: false, state: toUsageState(current, history), toast: null }
  }

  const beforeRemaining = updated.tokensRemaining + cost
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
    select: USAGE_SELECT,
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
    select: USAGE_SELECT,
  })
  const history = await loadHistory(userId)
  return toUsageState(updated, history)
}
