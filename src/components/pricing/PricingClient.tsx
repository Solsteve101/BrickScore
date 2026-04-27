'use client'

import Link from 'next/link'
import { useState } from 'react'

type Cycle = 'monthly' | 'yearly'

interface Tier {
  key: 'free' | 'pro' | 'business'
  name: string
  tagline: string
  highlight?: boolean
  badge?: string
  monthly: number
  yearly: number
  yearlyTotal: number
  yearlySavings: number
  features: { text: string; included: boolean }[]
  ctaLabel: string
}

const TIERS: Tier[] = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Für den Einstieg',
    monthly: 0,
    yearly: 0,
    yearlyTotal: 0,
    yearlySavings: 0,
    features: [
      { text: '40 Tokens pro Woche', included: true },
      { text: '5 KPIs + Deal-Score', included: true },
      { text: 'Link-Import & Text-Analyse', included: true },
      { text: '10-Jahres-Projektion', included: true },
      { text: 'Wasserzeichen auf Exporten', included: false },
    ],
    ctaLabel: 'Kostenlos starten',
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'Für aktive Investoren',
    highlight: true,
    badge: 'Beliebt',
    monthly: 16.99,
    yearly: 14.99,
    yearlyTotal: 179.88,
    yearlySavings: 24,
    features: [
      { text: 'Alles aus Free', included: true },
      { text: '400 Tokens pro Woche', included: true },
      { text: 'Kein Wasserzeichen', included: true },
      { text: 'Priority-Support', included: true },
    ],
    ctaLabel: 'Pro starten',
  },
  {
    key: 'business',
    name: 'Business',
    tagline: 'Für Teams und Profis',
    monthly: 55.99,
    yearly: 49.99,
    yearlyTotal: 599.88,
    yearlySavings: 72,
    features: [
      { text: 'Alles aus Pro', included: true },
      { text: 'Unbegrenzte Tokens', included: true },
      { text: 'White Label Exporte', included: true },
      { text: 'Eigenes Logo im PDF', included: true },
      { text: 'Team-Zugang', included: true },
      { text: 'API-Zugriff', included: true },
    ],
    ctaLabel: 'Business starten',
  },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Was sind Tokens?',
    a: 'Tokens sind dein Analyse-Guthaben. Eine Link-Analyse kostet 5 Tokens, ein manueller Deal 1 Token. Im Free-Plan bekommst du jede Woche 40 neue Tokens.',
  },
  {
    q: 'Kann ich jederzeit kündigen?',
    a: 'Ja, du kannst dein Abo jederzeit kündigen. Es läuft dann bis zum Ende der bezahlten Periode weiter.',
  },
  {
    q: 'Gibt es eine Testphase?',
    a: 'Der Free-Plan ist dauerhaft kostenlos. Du kannst BrickScore unbegrenzt mit 40 Tokens pro Woche nutzen.',
  },
  {
    q: 'Welche Zahlungsmethoden gibt es?',
    a: 'Wir akzeptieren Kreditkarte und SEPA-Lastschrift. (Kommt bald)',
  },
]

function fmtEur(n: number): string {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PricingClient() {
  const [cycle, setCycle] = useState<Cycle>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div style={{ background: '#ffffff', padding: '72px 20px 96px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* Heading */}
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            margin: 0,
            font: '700 44px/1.1 var(--font-dm-sans), sans-serif',
            letterSpacing: '-1.4px',
            color: '#0a0a0a',
            maxWidth: 720,
          }}>
            Einfache, transparente Preise
          </h1>
          <p style={{
            margin: 0,
            font: '400 16.5px/1.55 var(--font-dm-sans), sans-serif',
            color: '#6a6a6a',
            maxWidth: 560,
          }}>
            Starte kostenlos. Upgrade wenn du mehr brauchst.
          </p>
        </header>

        {/* Cycle toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
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

        {/* Pricing cards */}
        <div className="bs-pricing-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 18,
          alignItems: 'stretch',
          marginBottom: 64,
        }}>
          {TIERS.map((tier) => <TierCard key={tier.key} tier={tier} cycle={cycle} />)}
        </div>

        {/* FAQ */}
        <section style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{
            margin: 0,
            font: '700 26px/1.2 var(--font-dm-sans), sans-serif',
            letterSpacing: '-0.5px',
            color: '#0a0a0a',
            textAlign: 'center',
            marginBottom: 22,
          }}>
            Häufige Fragen
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ.map((item, i) => {
              const open = openFaq === i
              return (
                <div key={item.q} style={{
                  borderRadius: 12,
                  border: '1px solid #ececec',
                  background: '#ffffff',
                  overflow: 'hidden',
                  transition: 'border-color 130ms ease, box-shadow 130ms ease',
                  boxShadow: open ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '16px 18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      font: '500 15px/1.4 var(--font-dm-sans), sans-serif',
                      color: '#0a0a0a',
                    }}
                  >
                    {item.q}
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: '#9a9a9a', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 180ms ease' }}>
                      <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {open && (
                    <div style={{
                      padding: '0 18px 18px',
                      font: '400 14px/1.6 var(--font-dm-sans), sans-serif',
                      color: '#5a5a5a',
                    }}>
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .bs-pricing-grid {
            grid-template-columns: 1fr !important;
            max-width: 460px;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
    </div>
  )
}

function TierCard({ tier, cycle }: { tier: Tier; cycle: Cycle }) {
  const isFree = tier.key === 'free'
  const monthlyShown = cycle === 'monthly' ? tier.monthly : tier.yearly

  return (
    <div style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column', gap: 16,
      padding: '28px 26px 26px',
      borderRadius: 16,
      background: '#ffffff',
      border: tier.highlight ? '1px solid #0a0a0a' : '1px solid #ececec',
      boxShadow: tier.highlight
        ? '0 14px 38px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)'
        : '0 1px 3px rgba(0,0,0,0.04)',
      transform: tier.highlight ? 'translateY(-4px)' : 'none',
    }}>
      {tier.badge && (
        <span style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          padding: '5px 14px', borderRadius: 9999,
          background: '#0a0a0a', color: '#ffffff',
          font: '600 10.5px/1 var(--font-dm-sans), sans-serif',
          letterSpacing: 0.4, textTransform: 'uppercase',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        }}>
          {tier.badge}
        </span>
      )}

      <h3 style={{ margin: 0, font: '600 22px/1 var(--font-dm-sans), sans-serif', color: '#0a0a0a', letterSpacing: '-0.4px' }}>
        {tier.name}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ font: '600 34px/1 var(--font-jetbrains-mono), monospace', color: '#0a0a0a', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.6px' }}>
            €{fmtEur(monthlyShown)}
            <span style={{ color: '#9a9a9a', fontSize: 14, fontWeight: 500 }}>/Mon.</span>
          </span>
          {!isFree && cycle === 'yearly' && (
            <span style={{
              font: '500 15px/1 var(--font-jetbrains-mono), monospace',
              color: '#9a9a9a', textDecoration: 'line-through',
              fontVariantNumeric: 'tabular-nums',
            }}>
              €{fmtEur(tier.monthly)}
            </span>
          )}
        </div>
        <span style={{ font: '400 13.5px/1.4 var(--font-dm-sans), sans-serif', color: '#9a9a9a' }}>
          {tier.tagline}
        </span>
        {!isFree && cycle === 'yearly' && (
          <span style={{ font: '500 12.5px/1.4 var(--font-dm-sans), sans-serif', color: '#1f8a65' }}>
            du sparst €{tier.yearlySavings}/Jahr
          </span>
        )}
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tier.features.map((f) => (
          <li
            key={f.text}
            style={{
              display: 'inline-flex', alignItems: 'flex-start', gap: 9,
              font: '400 13.5px/1.45 var(--font-dm-sans), sans-serif',
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

      <Link
        href="/signup"
        style={{
          marginTop: 'auto',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', padding: '13px 16px',
          borderRadius: 10,
          background: tier.highlight
            ? 'linear-gradient(to bottom, #3d3d3d, #141414)'
            : '#ffffff',
          color: tier.highlight ? '#ffffff' : '#0a0a0a',
          border: tier.highlight ? '1px solid rgba(0,0,0,0.5)' : '1px solid #d8d8d8',
          font: '500 14.5px/1 var(--font-dm-sans), sans-serif', letterSpacing: '-0.1px',
          textDecoration: 'none',
          boxShadow: tier.highlight
            ? '0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)'
            : '0 1px 2px rgba(0,0,0,0.04)',
          transition: 'opacity 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background 150ms ease',
        }}
      >
        {tier.ctaLabel}
      </Link>
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
        padding: '8px 22px', borderRadius: 9999,
        background: 'transparent', border: 'none',
        font: '500 13px/1 var(--font-dm-sans), sans-serif',
        color: active ? '#ffffff' : '#7a7a7a',
        cursor: 'pointer',
        transition: 'color 180ms ease',
        minWidth: 96,
      }}
    >
      {children}
    </button>
  )
}
