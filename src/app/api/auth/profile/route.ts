import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateUser } from '@/lib/users-store'

interface Body {
  name?: string
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
  let body: Body
  try { body = await req.json() as Body } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  const name = (body.name ?? '').trim()
  if (name.length < 1 || name.length > 80) {
    return NextResponse.json({ error: 'invalid_name', message: 'Name muss 1–80 Zeichen lang sein.' }, { status: 400 })
  }
  const updated = await updateUser(session.user.id, { name })
  if (!updated) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true, name: updated.name })
}
