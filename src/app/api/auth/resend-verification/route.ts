import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/users-store'
import { createSignupToken } from '@/lib/token-store'
import { appBaseUrl, buildEmailHtml, sendEmail } from '@/lib/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Body {
  email?: string
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = await req.json() as Body
  } catch {
    return NextResponse.json({ ok: true })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) {
    // Never leak account state via validation errors either.
    return NextResponse.json({ ok: true })
  }

  const user = await findUserByEmail(email)
  if (user && user.provider === 'credentials' && !user.emailVerified) {
    const tk = await createSignupToken(user.id, user.email)
    const link = `${appBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(tk.token)}`
    const html = buildEmailHtml({
      heading: 'E-Mail bestätigen',
      intro: 'Du hast eine neue Bestätigungs-E-Mail für deinen brickscore-Account angefordert. Klicke auf den Button, um deine Adresse zu bestätigen. Der Link ist 24 Stunden gültig.',
      buttonLabel: 'E-Mail bestätigen',
      buttonHref: link,
      fallbackNote: 'Falls der Button nicht funktioniert: kopiere den Link in deinen Browser.',
    })
    await sendEmail({ to: user.email, subject: 'E-Mail bestätigen — brickscore', html })
  }

  // Always 200 — never leak whether the account exists or is already verified.
  return NextResponse.json({ ok: true })
}
