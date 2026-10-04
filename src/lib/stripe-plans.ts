import type { BillingInterval, UsagePlan } from './usage-shared'

export type PaidPlan = Exclude<UsagePlan, 'free'>

export interface PlanForPrice {
  plan: PaidPlan
  interval: BillingInterval
}

/**
 * Maps the configured Stripe price IDs to plan + billing interval.
 * Read at call time so missing env vars never crash module load.
 */
function priceTable(): { priceId: string | undefined; plan: PaidPlan; interval: BillingInterval }[] {
  return [
    { priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY, plan: 'pro', interval: 'monthly' },
    { priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY, plan: 'pro', interval: 'yearly' },
    { priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY, plan: 'business', interval: 'monthly' },
    { priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_YEARLY, plan: 'business', interval: 'yearly' },
  ]
}

export function planForPriceId(priceId: string | null | undefined): PlanForPrice | null {
  if (!priceId) return null
  const hit = priceTable().find((row) => row.priceId && row.priceId === priceId)
  return hit ? { plan: hit.plan, interval: hit.interval } : null
}
