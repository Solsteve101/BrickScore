import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

function isAuthorized(req: NextRequest): boolean {
  const vercelHeader = req.headers.get('x-vercel-cron')
  if (vercelHeader) return true
  const auth = req.headers.get('authorization') ?? ''
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  return auth === `Bearer ${expected}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const now = new Date()
  let processed = 0
  let expired = 0

  const pending = await prisma.referralCredit.findMany({
    where: { status: 'pending', availableAt: { lte: now } },
    include: {
      referrerUser: { select: { id: true, email: true, stripeCustomerId: true } },
      referredUser: { select: { email: true } },
    },
  })

  for (const credit of pending) {
    const referrer = credit.referrerUser
    let stripeCreditId: string | null = null
    try {
      if (!referrer) {
        throw new Error('referrer_missing')
      }

      const stripe = getStripe()
      let customerId = referrer.stripeCustomerId

      // Lazy: wenn Referrer noch keinen Stripe-Customer hat, erst anlegen
      if (!customerId) {
        if (!referrer.email) {
          throw new Error('referrer_email_missing')
        }
        const newCustomer = await stripe.customers.create({
          email: referrer.email,
          metadata: { userId: referrer.id, source: 'referral_credit_lazy' },
        })
        customerId = newCustomer.id
        await prisma.user.update({
          where: { id: referrer.id },
          data: { stripeCustomerId: customerId },
        })
      }

      const balanceTx = await stripe.customers.createBalanceTransaction(customerId, {
        amount: -credit.amountCents,
        currency: credit.currency,
        description: `Referral-Guthaben für ${credit.referredUser?.email ?? 'unbekannt'}`,
        metadata: { referralCreditId: credit.id },
      })
      stripeCreditId = balanceTx.id

      await prisma.referralCredit.update({
        where: { id: credit.id },
        data: { status: 'active', stripeCreditId },
      })
      processed++
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[cron/process-referrals] failed to credit', { creditId: credit.id, err: err instanceof Error ? err.message : String(err) })
    }
  }

  const expiredResult = await prisma.referralCredit.updateMany({
    where: { status: 'active', expiresAt: { lt: now } },
    data: { status: 'expired' },
  })
  expired = expiredResult.count

  return NextResponse.json({ processed, expired })
}
