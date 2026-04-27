import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

interface Body {
  priceId?: string
  plan?: string
  interval?: 'monthly' | 'yearly'
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = await req.json() as Body
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const priceId = (body.priceId ?? '').trim()
  const plan = (body.plan ?? '').trim()
  const interval = body.interval

  if (!priceId) {
    return NextResponse.json({ error: 'missing_price_id' }, { status: 400 })
  }
  if (!plan || (plan !== 'pro' && plan !== 'business')) {
    return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
  }
  if (interval !== 'monthly' && interval !== 'yearly') {
    return NextResponse.json({ error: 'invalid_interval' }, { status: 400 })
  }

  const session = await auth().catch(() => null)
  const customerEmail = session?.user?.email ?? undefined

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  try {
    const stripe = getStripe()
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/subscription?success=true&plan=${encodeURIComponent(plan)}&interval=${encodeURIComponent(interval)}`,
      cancel_url: `${baseUrl}/dashboard/subscription?canceled=true`,
      metadata: { plan, interval },
      ...(customerEmail ? { customer_email: customerEmail } : {}),
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
