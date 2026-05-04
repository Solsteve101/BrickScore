import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getCurrentDbUser } from '@/lib/db-user'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const returnUrl = `${baseUrl}/dashboard/subscription`

  try {
    const stripe = getStripe()
    let customerId = user.stripeCustomerId ?? null

    // Fallback: look up an existing Stripe customer by email for users who
    // paid before stripeCustomerId was persisted. Cache the id on the user
    // row so subsequent calls skip the Stripe lookup.
    if (!customerId && user.email) {
      const list = await stripe.customers.list({ email: user.email, limit: 1 })
      const found = list.data[0]
      if (found) {
        customerId = found.id
        await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: found.id } })
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'no_subscription', message: 'Du hast noch kein aktives Abonnement.' },
        { status: 404 },
      )
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return NextResponse.json({ url: portal.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'stripe_error'
    return NextResponse.json({ error: 'stripe_error', message }, { status: 500 })
  }
}
