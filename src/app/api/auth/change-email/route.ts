import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { findUserById, findUserByEmail } from '@/lib/users-store'
import { createEmailToken } from '@/lib/token-store'
import { appBaseUrl, buildEmailHtml, sendEmail } from '@/lib/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Body {
  newEmail?: string
  password?: string
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

  const newEmail = (body.newEmail ?? '').trim().toLowerCase()
  const password = body.password ?? ''

  if (!EMAIL_RE.test(newEmail)) {
    return NextResponse.json({ ok: false, message: 'Bitte gib eine gültige E-Mail-Adresse ein.' }, { status: 400 })
  }

  const user = await findUserById(session.user.id)
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Konto nicht gefunden.' }, { status: 404 })
  }
  if (user.provider !== 'credentials' || !user.passwordHash) {
    return NextResponse.json({ ok: false, message: 'E-Mail wird über deinen externen Anbieter verwaltet.' }, { status: 400 })
  }
  if (newEmail === user.email.toLowerCase()) {
    return NextResponse.json({ ok: false, message: 'Das ist bereits deine aktuelle E-Mail-Adresse.' }, { status: 400 })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ ok: false, message: 'Passwort ist falsch.' }, { status: 400 })
  }

  const taken = await findUserByEmail(newEmail)
  if (taken) {
    return NextResponse.json({ ok: false, message: 'Diese E-Mail ist bereits vergeben.' }, { status: 409 })
  }

  const tk = await createEmailToken(user.id, newEmail)
  const link = `${appBaseUrl()}/api/auth/confirm-email?token=${encodeURIComponent(tk.token)}`
  const html = buildEmailHtml({
    heading: 'E-Mail-Adresse bestätigen',
    intro: 'Klicke auf den Button unten, um deine neue E-Mail-Adresse für BrickScore zu bestätigen. Der Link ist 1 Stunde gültig.',
    buttonLabel: 'E-Mail bestätigen',
    buttonHref: link,
  })
  const sendRes = await sendEmail({ to: newEmail, subject: 'E-Mail-Adresse bestätigen — BrickScore', html })
  if (!sendRes.ok) {
    return NextResponse.json({ ok: false, message: 'Bestätigungs-E-Mail konnte nicht gesendet werden.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
