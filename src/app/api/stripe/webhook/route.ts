import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event
  try {
    if (secret && signature) {
      const stripe = getStripe()
      event = stripe.webhooks.constructEvent(rawBody, signature, secret)
    } else {
      // No webhook secret configured — accept the payload verbatim (dev/test only).
      event = JSON.parse(rawBody) as Stripe.Event
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid_signature'
    return NextResponse.json({ error: 'webhook_signature_invalid', message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const plan = session.metadata?.plan ?? null
    const interval = session.metadata?.interval ?? null
    // eslint-disable-next-line no-console
    console.log('[stripe] checkout.session.completed', {
      id: session.id,
      customerEmail: session.customer_details?.email ?? null,
      plan,
      interval,
      amountTotal: session.amount_total,
      currency: session.currency,
    })
  }

  return NextResponse.json({ received: true })
}
