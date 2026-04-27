import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findResetToken, consumeResetToken } from '@/lib/token-store'
import { findUserById, updateUser } from '@/lib/users-store'

interface PostBody {
  token?: string
  newPassword?: string
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ valid: false, error: 'missing_token' }, { status: 400 })
  const tk = await findResetToken(token)
  if (!tk) return NextResponse.json({ valid: false, error: 'invalid_or_expired' }, { status: 400 })
  return NextResponse.json({ valid: true })
}

export async function POST(req: NextRequest) {
  let body: PostBody
  try {
    body = await req.json() as PostBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const token = (body.token ?? '').trim()
  const newPassword = body.newPassword ?? ''

  if (!token) {
    return NextResponse.json({ ok: false, message: 'Token fehlt.' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ ok: false, message: 'Passwort muss mindestens 8 Zeichen haben.' }, { status: 400 })
  }

  const tk = await consumeResetToken(token)
  if (!tk) {
    return NextResponse.json({ ok: false, message: 'Der Link ist ungültig oder abgelaufen.' }, { status: 400 })
  }

  const user = await findUserById(tk.userId)
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Konto nicht gefunden.' }, { status: 404 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await updateUser(user.id, { passwordHash })

  return NextResponse.json({ ok: true })
}
