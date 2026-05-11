import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { claimReferral } from '@/lib/referral'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 })
  }
  let body: { code?: string }
  try {
    body = (await req.json()) as { code?: string }
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_body' }, { status: 400 })
  }
  const code = (body.code ?? '').toString()
  if (!code) {
    return NextResponse.json({ ok: false, reason: 'invalid_format' }, { status: 400 })
  }
  const result = await claimReferral(session.user.id, code)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
