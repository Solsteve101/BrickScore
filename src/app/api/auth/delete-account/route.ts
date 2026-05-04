import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { deleteUserById } from '@/lib/users-store'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
  // Drop the legacy JSON-file user row.
  const removed = await deleteUserById(session.user.id)
  // Drop the Prisma user (and cascade-delete deals / exports / token usages
  // via the schema's onDelete: Cascade rules). Email is the bridge — the
  // session id only matches the JSON store, not Prisma's cuid.
  const email = session.user.email
  if (email) {
    await prisma.user.deleteMany({ where: { email } })
  }
  if (!removed && !email) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
