import { NextRequest, NextResponse } from 'next/server'
import { consumeSignupToken } from '@/lib/token-store'
import { markEmailVerified } from '@/lib/users-store'
import { appBaseUrl } from '@/lib/email'
import { prisma } from '@/lib/prisma'

function redirectTo(target: string): NextResponse {
  return NextResponse.redirect(`${appBaseUrl()}${target}`)
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return redirectTo('/verify-email/error?reason=invalid')

  const result = await consumeSignupToken(token)
  if (!result.ok) {
    // Best-effort: look up the token row so we can pre-fill the email on the
    // error page (lets the user request a new mail without retyping it).
    const tk = await prisma.verificationToken
      .findUnique({ where: { token }, select: { email: true } })
      .catch(() => null)
    const emailParam = tk?.email ? `&email=${encodeURIComponent(tk.email)}` : ''
    return redirectTo(`/verify-email/error?reason=${encodeURIComponent(result.reason)}${emailParam}`)
  }

  await markEmailVerified(result.data.userId)
  return redirectTo('/verify-email/success')
}
