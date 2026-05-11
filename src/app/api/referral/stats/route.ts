import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrCreateReferralCode } from '@/lib/referral'

function maskEmail(email: string | null | undefined): string {
  if (!email) return '—'
  const at = email.indexOf('@')
  if (at <= 0) return email
  const local = email.slice(0, at)
  const domain = email.slice(at)
  const head = local.slice(0, Math.min(1, local.length))
  return `${head}${'*'.repeat(Math.max(local.length - 1, 1))}${domain}`
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  const referralCode = await getOrCreateReferralCode(userId)

  const [activeAgg, pendingAgg, lifetimeAgg, referralsCount, recent] = await Promise.all([
    prisma.referralCredit.aggregate({
      where: { referrerUserId: userId, status: 'active', usedAt: null },
      _sum: { amountCents: true },
    }),
    prisma.referralCredit.aggregate({
      where: { referrerUserId: userId, status: 'pending' },
      _sum: { amountCents: true },
    }),
    prisma.referralCredit.aggregate({
      where: { referrerUserId: userId, status: { in: ['active', 'used'] } },
      _sum: { amountCents: true },
    }),
    prisma.user.count({
      where: { referredByUserId: userId },
    }),
    prisma.referralCredit.findMany({
      where: { referrerUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { referredUser: { select: { email: true } } },
    }),
  ])

  return NextResponse.json({
    referralCode,
    balanceEuros: (activeAgg._sum.amountCents ?? 0) / 100,
    pendingEuros: (pendingAgg._sum.amountCents ?? 0) / 100,
    totalEarnedEuros: (lifetimeAgg._sum.amountCents ?? 0) / 100,
    referralsCount,
    recentCredits: recent.map((c) => ({
      id: c.id,
      createdAt: c.createdAt.toISOString(),
      amountEuros: c.amountCents / 100,
      status: c.status,
      referredEmail: maskEmail(c.referredUser?.email ?? null),
    })),
  })
}
