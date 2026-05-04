'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getUsage, setPlan as persistPlan, type UsagePlan, type BillingInterval } from '@/lib/usage-store'
import { getOrCreateOwnReferralCode } from '@/lib/referral-store'
import { pushToast } from '@/lib/toast'

type Cycle = 'monthly' | 'yearly'

type PlanKey = 'pro' | 'business'

const PLAN_RANK: Record<UsagePlan, number> = { free: 0, pro: 1, business: 2 }

const PRICE_IDS: Record<PlanKey, Record<Cycle, string | undefined>> = {
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
  },
  business: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_YEARLY,
  },
}

interface PriceInfo {
  monthly: number
  yearly: number // displayed monthly price under yearly billing
  yearlyTotal: number
  yearlySavings: number
}

const PRO_PRICE: PriceInfo = { monthly: 16.99, yearly: 14.99, yearlyTotal: 179.88, yearlySavings: 24 }
const BUSINESS_PRICE: PriceInfo = { monthly: 55.99, yearly: 49.99, yearlyTotal: 599.88, yearlySavings: 72 }

function fmtEur(n: number): string {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function SubscriptionClient() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [referralCode, setReferralCode] = useState('BRICK-XXXX')
  const [referralUrl, setReferralUrl] = useState('https://brickscore.de/ref/BRICK-XXXX')

  const [usageLoaded, setUsageLoaded] = useState(false)
  const [plan, setPlan] = useState<UsagePlan>('free')
  const [planInterval, setPlanInterval] = useState<BillingInterval | null>(null)
  const [tokensRemaining, setTokensRemaining] = useState(0)
  const [tokensMax, setTokensMax] = useState(20)
  const [copied, setCopied] = useState<'code' | 'url' | null>(null)
  const [cycle, setCycle] = useState<Cycle>('monthly')
  const [busyPlan, setBusyPlan] = useState<PlanKey | null>(null)
  const [portalBusy, setPortalBusy] = useState(false)

  useEffect(() => {
    const code = getOrCreateOwnReferralCode(userId ?? null)
    setReferralCode(code)
    setReferralUrl(`https://brickscore.de/ref/${code}`)
  }, [userId])

  useEffect(() => {
    let cancelled = false
    const sync = async () => {
      const u = await getUsage()
      if (cancelled) return
      setTokensRemaining(u.tokens_remaining)
      setTokensMax(u.tokens_max)
      setPlan(u.plan)
      setPlanInterval(u.interval ?? null)
      // Reflect the user's actual billing cycle as the default tab
      if (u.interval === 'monthly' || u.interval === 'yearly') {
        setCycle(u.interval)
      }
      setUsageLoaded(true)
    }
    void sync()
    const onFocus = () => { void sync() }
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // Handle Stripe Checkout return URL — apply plan upgrade or show cancellation toast.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const canceled = params.get('canceled')
    const planParam = params.get('plan')
    const intervalParam = params.get('interval')
    if (success === 'true' && (planParam === 'pro' || planParam === 'business')) {
      const interval: BillingInterval = intervalParam === 'yearly' ? 'yearly' : 'monthly'
      void (async () => {
        const next = await persistPlan(planParam, interval)
        setPlan(next.plan)
        setPlanInterval(next.interval ?? null)
        setTokensRemaining(next.tokens_remaining)
        setTokensMax(next.tokens_max)
        setCycle(interval)
        pushToast({ variant: 'success', title: 'Upgrade erfolgreich!', message: `Dein Plan wurde auf ${planParam === 'pro' ? 'Pro' : 'Business'} (${interval === 'monthly' ? 'monatlich' : 'jährlich'}) aktualisiert.` })
      })()
    } else if (canceled === 'true') {
      pushToast({ variant: 'info', message: 'Upgrade abgebrochen.' })
    }
    if (success || canceled) {
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      url.searchParams.delete('canceled')
      url.searchParams.delete('plan')
      url.searchParams.delete('interval')
      window.history.replaceState({}, '', url.pathname + (url.search || ''))
    }
  }, [])

  const startCheckout = async (key: PlanKey) => {
    if (busyPlan) return
    // Block downgrades and exact-match (same plan + same interval).
    const userRank = PLAN_RANK[plan]
    const targetRank = PLAN_RANK[key]
    if (userRank > targetRank) return
    if (userRank === targetRank && planInterval === cycle) return
    const priceId = PRICE_IDS[key][cycle]
    if (!priceId) {
      pushToast({ variant: 'error', message: `Preis-ID für ${key} (${cycle}) ist nicht konfiguriert.` })
      return
    }
    setBusyPlan(key)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan: key, interval: cycle }),
      })
      const json = await res.json().catch(() => ({})) as { url?: string; message?: string; error?: string }
      if (!res.ok || !json.url) {
        pushToast({ variant: 'error', message: json.message ?? json.error ?? 'Checkout konnte nicht gestartet werden.' })
        setBusyPlan(null)
        return
      }
      window.location.href = json.url
    } catch (e) {
      pushToast({ variant: 'error', message: e instanceof Error ? e.message : 'Checkout konnte nicht gestartet werden.' })
      setBusyPlan(null)
    }
  }

  const openBillingPortal = async () => {
    if (portalBusy) return
    setPortalBusy(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const json = await res.json().catch(() => ({})) as { url?: string; message?: string; error?: string }
      if (!res.ok || !json.url) {
        pushToast({ variant: 'error', message: json.message ?? 'Abo-Verwaltung konnte nicht geöffnet werden.' })
        setPortalBusy(false)
        return
      }
      window.location.href = json.url
    } catch (e) {
      pushToast({ variant: 'error', message: e instanceof Error ? e.message : 'Abo-Verwaltung konnte nicht geöffnet werden.' })
      setPortalBusy(false)
    }
  }

  const canManage = plan !== 'free'

  const used = Math.max(0, tokensMax - tokensRemaining)
  const pct = tokensMax > 0 ? Math.min(100, Math.round((used / tokensMax) * 100)) : 0

  const copy = async (val: string, key: 'code' | 'url') => {
    try {
      await navigator.clipboard.writeText(val)
      setCopied(key)
      setTimeout(() => setCopied(null), 1400)
    } catch { /* ignore */ }
  }

  return (
    <div className="bs-sub-page" style={{ padding: '36px 40px 60px' }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
        <h1 style={{ margin: 0, font: '700 28px/1.2 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
          Abonnement
        </h1>
        <p style={{ margin: 0, font: '400 14.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
          Dein aktueller Plan und Upgrade-Optionen.
        </p>
      </header>

      {/* Current plan */}
      <section style={{
        padding: '22px 24px',
        borderRadius: 14,
        background: '#ffffff',
        border: '1px solid #ececec',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', gap: 14,
        marginBottom: 22,
      }}>
        <div className="bs-sub-current-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <h2 style={{ margin: 0, font: '600 22px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', letterSpacing: '-0.3px' }}>
              {plan === 'pro' ? 'Pro' : plan === 'business' ? 'Business' : 'Free'}
            </h2>
            <span style={{
              padding: '3px 10px', borderRadius: 9999,
              background: '#EEEDEB', color: '#3a3a3a',
              font: '600 10.5px/1 var(--font-dm-sans), sans-serif',
              letterSpacing: 0.4, textTransform: 'uppercase',
            }}>
              Aktuell
            </span>
          </div>
          <button
            type="button"
            onClick={openBillingPortal}
            disabled={!canManage || portalBusy}
            className="bs-sub-manage-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '6px 12px', borderRadius: 10,
              background: '#FFFFFF', color: '#1C1C1C',
              border: '1px solid #D6D6D4',
              font: '500 12px/1 var(--font-dm-sans), sans-serif',
              cursor: !canManage || portalBusy ? 'not-allowed' : 'pointer',
              opacity: !canManage ? 0.5 : portalBusy ? 0.7 : 1,
              transition: 'all 0.2s ease',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { if (canManage && !portalBusy) e.currentTarget.style.background = '#F5F5F3' }}
            onMouseLeave={(e) => { if (canManage && !portalBusy) e.currentTarget.style.background = '#FFFFFF' }}
          >
            {portalBusy ? 'Öffnen…' : 'Abo verwalten'}
          </button>
        </div>

        <p style={{ margin: 0, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
          {plan === 'pro'
            ? '4x mehr Nutzung. Exporte ohne Wasserzeichen.'
            : plan === 'business'
              ? '10x mehr Nutzung. White Label Exporte.'
              : 'Kostenlos testen. Exporte mit Wasserzeichen.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: usageLoaded ? 1 : 0, transition: 'opacity 200ms ease' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ font: '500 12px/1 var(--font-dm-sans), sans-serif', color: '#7a7a7a' }}>
              Nutzung diese Woche
            </span>
            <span style={{ font: '500 12px/1 var(--font-jetbrains-mono), monospace', color: '#7a7a7a', fontVariantNumeric: 'tabular-nums' }}>
              {pct}% verbraucht
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 9999, background: '#f1f0ec', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: '#0a0a0a', borderRadius: 9999, transition: 'width 280ms ease' }} />
          </div>
        </div>
      </section>

      {/* Billing cycle toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <CycleToggle cycle={cycle} onChange={setCycle} />
        <span style={{
          padding: '4px 10px', borderRadius: 9999,
          background: 'rgba(184,150,12,0.12)', color: '#8a6f0a',
          border: '1px solid rgba(184,150,12,0.25)',
          font: '600 11px/1 var(--font-dm-sans), sans-serif',
          letterSpacing: 0.3, whiteSpace: 'nowrap',
        }}>
          Spare bis zu 12%
        </span>
      </div>

      {/* Upgrade cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 22 }}>
        <PlanCard
          name="Pro"
          planKey="pro"
          price={PRO_PRICE}
          cycle={cycle}
          tagline="Für aktive Investoren"
          features={[
            { text: 'Alles aus Free', included: true },
            { text: '4x mehr Nutzung', included: true },
            { text: 'Kein Wasserzeichen', included: true },
          ]}
          currentPlan={plan}
          currentInterval={planInterval}
          busy={busyPlan === 'pro'}
          onUpgrade={() => { void startCheckout('pro') }}
        />
        <PlanCard
          name="Business"
          planKey="business"
          price={BUSINESS_PRICE}
          cycle={cycle}
          tagline="Für Teams und Profis"
          features={[
            { text: 'Alles aus Pro', included: true },
            { text: '10x mehr Nutzung', included: true },
            { text: 'Priority-Support', included: true },
            { text: 'White Label Exporte', included: true },
            { text: 'Eigenes Logo im PDF-Export', included: true },
            { text: 'Team-Zugang (bald verfügbar)', included: true },
            { text: 'API-Zugriff (bald verfügbar)', included: true },
          ]}
          currentPlan={plan}
          currentInterval={planInterval}
          busy={busyPlan === 'business'}
          onUpgrade={() => { void startCheckout('business') }}
        />
      </div>

      {/* Referral */}
      <section style={{
        padding: '22px 24px',
        borderRadius: 14,
        background: '#F9F8F6',
        border: '1px solid #E7E5E1',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h2 style={{ margin: 0, font: '600 18px/1.2 var(--font-dm-sans), sans-serif', color: '#0a0a0a', letterSpacing: '-0.2px' }}>
            Freunde einladen, mitverdienen
          </h2>
          <p style={{ margin: 0, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
            Für jeden Freund der ein Abo abschließt, bekommst du dauerhaft 10% seines Abonnements gutgeschrieben.
          </p>
        </div>

        <CopyRow label="Referral-Code" value={referralCode} copied={copied === 'code'} onCopy={() => void copy(referralCode, 'code')} mono />
        <CopyRow label="Share-Link" value={referralUrl} copied={copied === 'url'} onCopy={() => void copy(referralUrl, 'url')} />
      </section>
    </div>
  )
}

function CycleToggle({ cycle, onChange }: { cycle: Cycle; onChange: (c: Cycle) => void }) {
  return (
    <div
      role="tablist"
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center',
        padding: 4, borderRadius: 9999,
        background: '#f1f0ec',
        border: '1px solid #e7e5e1',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 4, bottom: 4,
          left: cycle === 'monthly' ? 4 : 'calc(50% + 0px)',
          width: 'calc(50% - 4px)',
          background: '#0a0a0a',
          borderRadius: 9999,
          transition: 'left 220ms cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
        }}
      />
      <CycleBtn active={cycle === 'monthly'} onClick={() => onChange('monthly')}>Monatlich</CycleBtn>
      <CycleBtn active={cycle === 'yearly'} onClick={() => onChange('yearly')}>Jährlich</CycleBtn>
    </div>
  )
}

function CycleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        position: 'relative', zIndex: 1,
        padding: '8px 18px', borderRadius: 9999,
        background: 'transparent', border: 'none',
        font: '500 13px/1 var(--font-dm-sans), sans-serif',
        color: active ? '#ffffff' : '#7a7a7a',
        cursor: 'pointer',
        transition: 'color 180ms ease',
        minWidth: 92,
      }}
    >
      {children}
    </button>
  )
}

function planButtonStyle(
  variant: 'current' | 'included' | 'gold' | 'neutral-active' | 'black',
  busy: boolean,
  disabled: boolean,
): React.CSSProperties {
  const base: React.CSSProperties = {
    marginTop: 'auto', width: '100%',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 24px', borderRadius: 10,
    font: '500 14px/1 var(--font-dm-sans), Inter, sans-serif',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: busy ? 0.85 : 1,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  }
  if (variant === 'current' || variant === 'included') {
    return {
      ...base,
      background: '#FFFFFF',
      color: '#1C1C1C',
      border: '1px solid #D6D6D4',
      opacity: 0.5,
      boxShadow: 'none',
    }
  }
  // gold, neutral-active, black all share the same active black style
  return {
    ...base,
    background: '#1C1C1C',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: 'none',
    cursor: busy ? 'wait' : 'pointer',
  }
}

function PlanCard({
  name, planKey, price, cycle, tagline, features, currentPlan, currentInterval, busy, onUpgrade,
}: {
  name: string
  planKey: PlanKey
  price: PriceInfo
  cycle: Cycle
  tagline: string
  features: { text: string; included: boolean }[]
  currentPlan: UsagePlan
  currentInterval: BillingInterval | null
  busy: boolean
  onUpgrade: () => void
}) {
  const cardRank = PLAN_RANK[planKey]
  const userRank = PLAN_RANK[currentPlan]
  const isPlanCurrent = userRank === cardRank
  const isIncluded = userRank > cardRank
  const exactMatch = isPlanCurrent && currentInterval === cycle
  const switchToYearly = isPlanCurrent && currentInterval === 'monthly' && cycle === 'yearly'
  const switchToMonthly = isPlanCurrent && currentInterval === 'yearly' && cycle === 'monthly'

  type Variant = 'current' | 'included' | 'gold' | 'neutral-active' | 'black'
  let variant: Variant
  let buttonLabel: string
  if (exactMatch) {
    variant = 'current'
    buttonLabel = 'Aktueller Plan'
  } else if (isIncluded) {
    variant = 'included'
    buttonLabel = 'Inkludiert'
  } else if (switchToYearly) {
    variant = 'gold'
    buttonLabel = busy ? 'Weiterleiten…' : 'Auf Jährlich wechseln'
  } else if (switchToMonthly) {
    variant = 'neutral-active'
    buttonLabel = busy ? 'Weiterleiten…' : 'Auf Monatlich wechseln'
  } else {
    variant = 'black'
    buttonLabel = busy ? 'Weiterleiten…' : `Upgrade auf ${name}`
  }
  const passive = variant === 'current' || variant === 'included'
  const disabled = passive || busy
  return (
    <div style={{
      padding: '24px 24px 22px', borderRadius: 14,
      background: '#ffffff', border: '1px solid #ececec',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <h3 style={{ margin: 0, font: '600 20px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', letterSpacing: '-0.3px' }}>
        {name}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ font: '600 26px/1 var(--font-jetbrains-mono), monospace', color: '#0a0a0a', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px' }}>
            €{fmtEur(cycle === 'monthly' ? price.monthly : price.yearly)}
            <span style={{ color: '#9a9a9a', fontSize: 14, fontWeight: 500 }}>/Mon.</span>
          </span>
          {cycle === 'yearly' && (
            <span style={{
              font: '500 14px/1 var(--font-jetbrains-mono), monospace',
              color: '#9a9a9a', textDecoration: 'line-through',
              fontVariantNumeric: 'tabular-nums',
            }}>
              €{fmtEur(price.monthly)}
            </span>
          )}
        </div>
        <span style={{ font: '400 12.5px/1.4 var(--font-dm-sans), sans-serif', color: '#9a9a9a' }}>
          {tagline}
        </span>
        {cycle === 'yearly' && (
          <span style={{ font: '500 12.5px/1.4 var(--font-dm-sans), sans-serif', color: '#1f8a65' }}>
            €{fmtEur(price.yearlyTotal)}/Jahr — du sparst €{price.yearlySavings}
          </span>
        )}
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {features.map((f) => (
          <li
            key={f.text}
            style={{
              display: 'inline-flex', alignItems: 'flex-start', gap: 9,
              font: '400 13px/1.45 var(--font-dm-sans), sans-serif',
              color: f.included ? '#3a3a3a' : '#9a9a9a',
            }}
          >
            {f.included ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: '#1f8a65', flexShrink: 0, marginTop: 2 }}>
                <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: '#c9c9c9', flexShrink: 0, marginTop: 2 }}>
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            <span>{f.text}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={disabled ? undefined : onUpgrade}
        disabled={disabled}
        title={buttonLabel}
        style={planButtonStyle(variant, busy, disabled)}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

function CopyRow({ label, value, copied, onCopy, mono }: { label: string; value: string; copied: boolean; onCopy: () => void; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ font: '500 11px/1 var(--font-dm-sans), sans-serif', letterSpacing: 0.6, textTransform: 'uppercase', color: '#9a9a9a' }}>
        {label}
      </span>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 4px 4px 12px', borderRadius: 9,
        background: '#ffffff', border: '1px solid #ececec',
      }}>
        <span style={{
          flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          font: mono
            ? '500 14px/1 var(--font-jetbrains-mono), monospace'
            : '400 13.5px/1 var(--font-dm-sans), sans-serif',
          color: '#0a0a0a',
        }}>
          {value}
        </span>
        <button
          type="button"
          onClick={onCopy}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '8px 16px', borderRadius: 10,
            background: copied ? 'rgba(31,138,101,0.12)' : '#1C1C1C',
            color: copied ? '#1a6a45' : '#FFFFFF',
            border: copied ? '1px solid rgba(31,138,101,0.3)' : 'none',
            font: '500 14px/1 var(--font-dm-sans), sans-serif',
            cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { if (!copied) e.currentTarget.style.background = '#2C2C2C' }}
          onMouseLeave={(e) => { if (!copied) e.currentTarget.style.background = '#1C1C1C' }}
        >
          {copied ? 'Kopiert' : 'Kopieren'}
        </button>
      </div>
    </div>
  )
}
