import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { findUserById, updateUser } from '@/lib/users-store'

interface Body {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: 'Nicht angemeldet.' }, { status: 401 })
  }

  let body: Body
  try { body = await req.json() as Body } catch {
    return NextResponse.json({ ok: false, message: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const currentPassword = body.currentPassword ?? ''
  const newPassword = body.newPassword ?? ''
  const confirmPassword = body.confirmPassword ?? ''

  if (newPassword.length < 8) {
    return NextResponse.json({ ok: false, message: 'Neues Passwort muss mindestens 8 Zeichen haben.' }, { status: 400 })
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ ok: false, message: 'Die Passwörter stimmen nicht überein.' }, { status: 400 })
  }

  const user = await findUserById(session.user.id)
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Konto nicht gefunden.' }, { status: 404 })
  }
  if (user.provider !== 'credentials' || !user.passwordHash) {
    return NextResponse.json({ ok: false, message: 'Passwort wird über deinen externen Anbieter verwaltet.' }, { status: 400 })
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ ok: false, message: 'Aktuelles Passwort ist falsch.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await updateUser(user.id, { passwordHash })
  return NextResponse.json({ ok: true })
}
