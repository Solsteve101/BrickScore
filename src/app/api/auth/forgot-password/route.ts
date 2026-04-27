import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/users-store'
import { createResetToken } from '@/lib/token-store'
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
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) {
    // Don't leak whether the email is invalid — return generic success.
    return NextResponse.json({ ok: true })
  }

  const user = await findUserByEmail(email)
  if (user && user.provider === 'credentials') {
    const tk = await createResetToken(user.id, user.email)
    const link = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(tk.token)}`
    const html = buildEmailHtml({
      heading: 'Passwort zurücksetzen',
      intro: 'Du hast eine Anfrage gestellt, dein BrickScore-Passwort zurückzusetzen. Klicke auf den Button unten, um ein neues Passwort zu setzen. Der Link ist 1 Stunde gültig.',
      buttonLabel: 'Passwort zurücksetzen',
      buttonHref: link,
    })
    // Fire-and-forget delivery; we still return ok regardless to avoid leaking account state.
    await sendEmail({ to: user.email, subject: 'Passwort zurücksetzen — BrickScore', html })
  }

  return NextResponse.json({ ok: true })
}
