import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const REFERRAL_RATE = 0.10
const REFERRER_GRACE_MONTHS = 12

function monthsAgo(d: Date, months: number): Date {
  const out = new Date(d.getTime())
  out.setUTCMonth(out.getUTCMonth() - months)
  return out
}

async function findUserByEmail(email: string | null | undefined) {
  if (!email) return null
  const norm = email.toLowerCase().trim()
  return prisma.user.findUnique({ where: { email: norm } })
}

async function maybeCreateReferralCredit(invoice: Stripe.Invoice): Promise<void> {
  const invoiceId = invoice.id
  if (!invoiceId) return
  const amountPaid = invoice.amount_paid
  if (!amountPaid || amountPaid <= 0) return

  const email = invoice.customer_email ?? null
  const user = await findUserByEmail(email)
  if (!user) return
  if (!user.referredByUserId) return

  const referrer = await prisma.user.findUnique({
    where: { id: user.referredByUserId },
    select: { id: true, subscriptionCancelledAt: true },
  })
  if (!referrer) return

  // Verfall-Check: Wenn Referrer-Sub seit > 12 Monaten gekündigt ist → kein Credit
  if (referrer.subscriptionCancelledAt) {
    const cutoff = monthsAgo(new Date(), REFERRER_GRACE_MONTHS)
    if (referrer.subscriptionCancelledAt < cutoff) return
  }

  const amountCents = Math.round(amountPaid * REFERRAL_RATE)
  if (amountCents <= 0) return

  const availableAt = new Date()
  availableAt.setUTCDate(availableAt.getUTCDate() + 30)

  const currency = (invoice.currency ?? 'eur').toLowerCase()

  try {
    await prisma.referralCredit.create({
      data: {
        referrerUserId: referrer.id,
        referredUserId: user.id,
        stripeInvoiceId: invoiceId,
        amountCents,
        currency,
        status: 'pending',
        availableAt,
      },
    })
  } catch (err) {
    // unique constraint on stripeInvoiceId — webhook re-delivery, idempotent skip
    const code = (err as { code?: string }).code
    if (code !== 'P2002') {
      // eslint-disable-next-line no-console
      console.error('[stripe webhook] referral credit insert failed', { invoiceId, err })
    }
  }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null
  if (!customerId) return
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
  if (!user) return

  const cancelledAt = new Date()
  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionCancelledAt: cancelledAt },
  })

  const expiresAt = new Date(cancelledAt.getTime())
  expiresAt.setUTCMonth(expiresAt.getUTCMonth() + REFERRER_GRACE_MONTHS)

  await prisma.referralCredit.updateMany({
    where: { referrerUserId: user.id, status: 'active', expiresAt: null },
    data: { expiresAt },
  })
}

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
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null
    const email = session.customer_details?.email ?? null
    // eslint-disable-next-line no-console
    console.log('[stripe] checkout.session.completed', {
      id: session.id,
      customerEmail: email,
      customerId,
      plan,
      interval,
      amountTotal: session.amount_total,
      currency: session.currency,
    })
    if (customerId && email) {
      await prisma.user.updateMany({
        where: { email, stripeCustomerId: null },
        data: { stripeCustomerId: customerId },
      })
    }
  }

  if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    await maybeCreateReferralCredit(invoice)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await handleSubscriptionDeleted(sub)
  }

  return NextResponse.json({ received: true })
}
