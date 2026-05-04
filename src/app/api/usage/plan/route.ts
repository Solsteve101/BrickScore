import { NextResponse } from 'next/server'
import { getCurrentDbUser } from '@/lib/db-user'
import { setPlanForUser } from '@/lib/usage-server'
import type { BillingInterval, UsagePlan } from '@/lib/usage-shared'

interface PlanBody {
  plan?: string
  interval?: string | null
}

function parsePlan(p: unknown): UsagePlan | null {
  return p === 'free' || p === 'pro' || p === 'business' ? p : null
}

function parseInterval(i: unknown): BillingInterval | null {
  return i === 'monthly' || i === 'yearly' ? i : null
}

export async function PUT(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = (await req.json()) as PlanBody
  const plan = parsePlan(body.plan)
  if (!plan) return NextResponse.json({ error: 'invalid plan' }, { status: 400 })
  const interval = parseInterval(body.interval)
  const state = await setPlanForUser(user.id, plan, interval)
  return NextResponse.json(state)
}
