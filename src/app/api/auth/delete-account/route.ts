import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { deleteUserById } from '@/lib/users-store'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
  const removed = await deleteUserById(session.user.id)
  if (!removed) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
