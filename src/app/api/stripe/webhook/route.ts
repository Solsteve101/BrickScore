import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { planForPriceId, type PlanForPrice } from '@/lib/stripe-plans'
import { setPlanForUser } from '@/lib/usage-server'
import { PLAN_MAX } from '@/lib/usage-shared'

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

// Subscription statuses that keep a paid plan. past_due stays paid while Stripe retries the charge.
const PAID_STATUSES: ReadonlySet<Stripe.Subscription.Status> = new Set(['active', 'trialing', 'past_due'])

interface UserHint {
  userId?: string | null
  email?: string | null
}

/**
 * Finds the BrickScore user for a Stripe customer and links the customer ID
 * if it isn't stored yet. The trusted userId from our own checkout metadata
 * wins over the email fallback.
 */
async function resolveUserForCustomer(customerId: string, hint: UserHint) {
  const byCustomer = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
  if (byCustomer) return byCustomer

  if (hint.userId) {
    const byId = await prisma.user.findUnique({ where: { id: hint.userId } })
    if (byId) {
      return prisma.user.update({ where: { id: byId.id }, data: { stripeCustomerId: customerId } })
    }
  }

  const byEmail = await findUserByEmail(hint.email)
  if (byEmail && !byEmail.stripeCustomerId) {
    return prisma.user.update({ where: { id: byEmail.id }, data: { stripeCustomerId: customerId } })
  }
  return null
}

/**
 * Derives the plan from the customer's *current* subscriptions at Stripe and
 * writes it to the user. Reading live state (instead of trusting the event
 * payload) makes this idempotent and safe against re-delivered or
 * out-of-order events.
 */
async function syncPlanFromStripe(customerId: string, hint: UserHint): Promise<void> {
  const user = await resolveUserForCustomer(customerId, hint)
  if (!user) return

  const stripe = getStripe()
  const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 })

  let best: PlanForPrice | null = null
  let hasUnmappedPaidSub = false
  for (const sub of subs.data) {
    if (!PAID_STATUSES.has(sub.status)) continue
    for (const item of sub.items.data) {
      const mapped = planForPriceId(item.price.id)
      if (!mapped) {
        hasUnmappedPaidSub = true
        continue
      }
      if (!best || PLAN_MAX[mapped.plan] > PLAN_MAX[best.plan]) best = mapped
    }
  }

  // An active subscription on a price we don't know is a config issue — don't punish the user for it.
  if (!best && hasUnmappedPaidSub) {
    // eslint-disable-next-line no-console
    console.error('[stripe webhook] active subscription with unknown price', { customerId })
    return
  }

  const nextPlan = best?.plan ?? 'free'
  const nextInterval = best?.interval ?? null
  if (user.plan === nextPlan && (user.billingInterval ?? null) === nextInterval) return
  await setPlanForUser(user.id, nextPlan, nextInterval)
}

function customerIdOf(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!customer) return null
  return typeof customer === 'string' ? customer : customer.id
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret) {
    // eslint-disable-next-line no-console
    console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'webhook_not_configured' }, { status: 500 })
  }
  if (!signature) {
    return NextResponse.json({ error: 'webhook_signature_missing' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid_signature'
    return NextResponse.json({ error: 'webhook_signature_invalid', message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = customerIdOf(session.customer)
    if (session.mode === 'subscription' && customerId) {
      await syncPlanFromStripe(customerId, {
        userId: session.client_reference_id ?? session.metadata?.userId ?? null,
        email: session.customer_details?.email ?? session.customer_email ?? null,
      })
    }
  }

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const sub = event.data.object as Stripe.Subscription
    const customerId = customerIdOf(sub.customer)
    if (customerId) {
      await syncPlanFromStripe(customerId, { userId: sub.metadata?.userId ?? null })
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
