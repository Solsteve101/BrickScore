import { NextResponse } from 'next/server'
import { getCurrentDbUser } from '@/lib/db-user'
import { getUsageForUser } from '@/lib/usage-server'

export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const state = await getUsageForUser(user.id)
  return NextResponse.json(state)
}
