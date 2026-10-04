import { NextRequest, NextResponse } from 'next/server'
import { getCurrentDbUser } from '@/lib/db-user'
import { getStripe } from '@/lib/stripe'
import { planForPriceId } from '@/lib/stripe-plans'

export const runtime = 'nodejs'

interface Body {
  priceId?: string
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = await req.json() as Body
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const priceId = (body.priceId ?? '').trim()
  if (!priceId) {
    return NextResponse.json({ error: 'missing_price_id' }, { status: 400 })
  }
  // Plan and interval are derived from the price on the server — never trusted from the client.
  const target = planForPriceId(priceId)
  if (!target) {
    return NextResponse.json({ error: 'invalid_price_id' }, { status: 400 })
  }

  const user = await getCurrentDbUser().catch(() => null)
  if (!user) {
    return NextResponse.json({ error: 'unauthorized', message: 'Bitte melde dich an, um ein Abo abzuschließen.' }, { status: 401 })
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  try {
    const stripe = getStripe()
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/subscription?success=true&plan=${encodeURIComponent(target.plan)}&interval=${encodeURIComponent(target.interval)}`,
      cancel_url: `${baseUrl}/dashboard/subscription?canceled=true`,
      client_reference_id: user.id,
      metadata: { userId: user.id, plan: target.plan, interval: target.interval },
      subscription_data: { metadata: { userId: user.id } },
      ...(user.stripeCustomerId ? { customer: user.stripeCustomerId } : { customer_email: user.email }),
    })

    if (!checkout.url) {
      return NextResponse.json({ error: 'no_checkout_url' }, { status: 500 })
    }

    return NextResponse.json({ url: checkout.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'stripe_error'
    return NextResponse.json({ error: 'stripe_error', message }, { status: 500 })
  }
}
