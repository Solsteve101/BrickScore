import { NextRequest, NextResponse } from 'next/server'
import { consumeEmailToken } from '@/lib/token-store'
import { findUserById, findUserByEmail, updateUserEmail } from '@/lib/users-store'
import { appBaseUrl } from '@/lib/email'

function redirectTo(target: string): NextResponse {
  return NextResponse.redirect(`${appBaseUrl()}${target}`)
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return redirectTo('/dashboard/settings?email=invalid')

  const tk = await consumeEmailToken(token)
  if (!tk) return redirectTo('/dashboard/settings?email=invalid')

  const user = await findUserById(tk.userId)
  if (!user) return redirectTo('/dashboard/settings?email=invalid')

  // Re-check email is still free at confirmation time
  const taken = await findUserByEmail(tk.newEmail)
  if (taken && taken.id !== user.id) {
    return redirectTo('/dashboard/settings?email=taken')
  }

  await updateUserEmail(user.id, tk.newEmail)
  return redirectTo('/dashboard/settings?email=confirmed')
}
