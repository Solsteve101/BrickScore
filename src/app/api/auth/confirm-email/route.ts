import { NextRequest, NextResponse } from 'next/server'
import { consumeEmailToken } from '@/lib/token-store'
import { findUserById, findUserByEmail } from '@/lib/users-store'
import { promises as fs } from 'fs'
import path from 'path'
import { appBaseUrl } from '@/lib/email'

const USERS_PATH = path.join(process.cwd(), 'src', 'data', 'users.json')

interface StoredUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  passwordHash?: string | null
  provider: 'credentials' | 'google'
  createdAt: string
}

async function updateUserEmail(id: string, newEmail: string): Promise<void> {
  const raw = await fs.readFile(USERS_PATH, 'utf8')
  const users = JSON.parse(raw) as StoredUser[]
  const idx = users.findIndex((u) => u.id === id)
  if (idx < 0) return
  users[idx] = { ...users[idx], email: newEmail }
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2) + '\n', 'utf8')
}

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
