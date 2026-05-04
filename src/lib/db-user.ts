import { auth } from './auth'
import { prisma } from './prisma'

/**
 * Resolves the current NextAuth session to a Prisma User row.
 *
 * Looks up by id first (the path for fresh logins, where the session id is
 * the Prisma cuid). Falls back to email upsert — covers legacy JWTs that
 * still carry the old JSON-file UUID and any account that hasn't logged in
 * since the database migration.
 *
 * Returns null if there is no authenticated session.
 */
export async function getCurrentDbUser() {
  const session = await auth()
  const sessionId = session?.user?.id
  const email = session?.user?.email
  if (!sessionId && !email) return null

  if (sessionId) {
    const byId = await prisma.user.findUnique({ where: { id: sessionId } })
    if (byId) return byId
  }
  if (!email) return null
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
  })
}
