import { NextResponse } from 'next/server'
import { getCurrentDbUser } from '@/lib/db-user'
import { spendTokensForUser } from '@/lib/usage-server'
import type { UsageAction } from '@/lib/usage-shared'

const VALID_ACTIONS: ReadonlySet<UsageAction> = new Set([
  'link_analyse',
  'text_analyse',
  'manual_session',
  'export',
])

interface SpendBody {
  action?: string
  detail?: string
}

export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = (await req.json()) as SpendBody
  const action = body.action as UsageAction
  if (!action || !VALID_ACTIONS.has(action)) {
    return NextResponse.json({ error: 'invalid action' }, { status: 400 })
  }
  const result = await spendTokensForUser(user.id, action, body.detail)
  return NextResponse.json(result, { status: result.ok ? 200 : 402 })
}
