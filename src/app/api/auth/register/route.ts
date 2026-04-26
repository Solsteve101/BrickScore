import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUser, findUserByEmail } from '@/lib/users-store'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface RegisterBody {
  email?: string
  password?: string
}

export async function POST(req: NextRequest) {
  let body: RegisterBody
  try {
    body = await req.json() as RegisterBody
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email', message: 'Bitte gib eine gültige E-Mail-Adresse ein.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'weak_password', message: 'Passwort muss mindestens 8 Zeichen haben.' }, { status: 400 })
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    return NextResponse.json({ error: 'email_taken', message: 'Diese E-Mail ist bereits registriert.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await createUser({
    id: crypto.randomUUID(),
    email,
    name: email.split('@')[0],
    image: null,
    passwordHash,
    provider: 'credentials',
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}
