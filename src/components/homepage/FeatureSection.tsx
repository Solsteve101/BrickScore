'use client'

import { useState } from 'react'

interface Tab {
  id: string
  label: string
  headline: string
  sub: string
  bullets: string[]
  mockup: React.ReactNode
}

function UrlMockup() {
  return (
    <div
      style={{
        background: '#f8f8f8',
        border: '1px solid #e5e5e5',
        borderRadius: 12,
        padding: 24,
        fontFamily: 'var(--font-dm-sans)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 7, padding: '10px 14px', font: '400 13px/1 var(--font-dm-sans)', color: '#aaa' }}>
          https://www.immoscout24.de/expose/...
        </div>
        <div style={{ background: '#0a0a0a', color: '#fff', padding: '10px 16px', borderRadius: 7, font: '500 13px/1 var(--font-dm-sans)', whiteSpace: 'nowrap' }}>
          Analysieren →
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          ['Kaufpreis', '€ 425.000'],
          ['Bundesland', 'Berlin'],
          ['Nebenkosten', '€ 48.594'],
          ['Eigenkapital', '€ 140.000'],
          ['Laufende Kosten', '€ 360/Monat'],
          ['Monatsmiete', '€ 2.480'],
        ].map(([k, v]) => (
          <div key={k} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 7, padding: '10px 14px' }}>
            <div style={{ font: '400 11px/1 var(--font-dm-sans)', color: '#9a9a9a', marginBottom: 5 }}>{k}</div>
            <div style={{ font: '600 14px/1 var(--font-dm-sans)', color: '#0a0a0a' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function KpiMockup() {
  const row1 = [
    { label: 'Monats-Cashflow', value: '+€635', color: '#1f8a65' },
    { label: 'Jahres-Cashflow', value: '+€7.617', color: '#1f8a65' },
    { label: 'Netto-Rendite', value: '5,1 %', color: '#0a0a0a' },
  ]
  const row2 = [
    { label: 'Cash-on-Cash', value: '5,4 %', color: '#1f8a65' },
    { label: 'LTV', value: '80,6 %', color: '#0a0a0a' },
  ]
  return (
    <div style={{ background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
        {row1.map((k) => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ font: '400 11px/1 var(--font-dm-sans)', color: '#9a9a9a', marginBottom: 8 }}>{k.label}</div>
            <div style={{ font: '700 20px/1 var(--font-dm-sans)', letterSpacing: '-0.02em', color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {row2.map((k) => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ font: '400 11px/1 var(--font-dm-sans)', color: '#9a9a9a', marginBottom: 8 }}>{k.label}</div>
            <div style={{ font: '700 20px/1 var(--font-dm-sans)', letterSpacing: '-0.02em', color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardMockup() {
  const deals = [
    { city: 'Hamburg', price: '€ 389.000', rendite: '6,4%', score: 82, tag: 'Stark' },
    { city: 'Berlin', price: '€ 425.000', rendite: '5,8%', score: 74, tag: 'Gut' },
    { city: 'München', price: '€ 590.000', rendite: '4,1%', score: 58, tag: 'Schwach' },
  ]
  return (
    <div style={{ background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: 12, padding: 24 }}>
      <div style={{ font: '500 12px/1 var(--font-dm-sans)', color: '#9a9a9a', marginBottom: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Gespeicherte Deals · 3
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {deals.map((d) => (
          <div key={d.city} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ font: '500 13px/1 var(--font-dm-sans)', color: '#0a0a0a', marginBottom: 4 }}>{d.city}</div>
              <div style={{ font: '400 12px/1 var(--font-dm-sans)', color: '#9a9a9a' }}>{d.price}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ font: '700 16px/1 var(--font-dm-sans)', color: '#1f8a65', letterSpacing: '-0.01em' }}>{d.rendite}</div>
              <div style={{ font: '500 11px/1 var(--font-dm-sans)', color: '#b8921a', marginTop: 3 }}>Score {d.score}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TABS: Tab[] = [
  {
    id: 'url',
    label: 'URL-Import',
    headline: 'Link einfügen, Analyse startet',
    sub: 'BrickScore liest Kaufpreis, Fläche und Standort direkt aus dem Inserat. Kaufnebenkosten nach Bundesland werden automatisch berechnet.',
    bullets: [
      'Daten direkt aus dem Inserat',
      'Kaufnebenkosten nach Bundesland',
      'Kalkulation läuft live',
    ],
    mockup: <UrlMockup />,
  },
  {
    id: 'kpis',
    label: 'Rendite KPIs',
    headline: 'Alle KPIs auf einen Blick',
    sub: 'Monats-Cashflow, Netto-Rendite und Cash-on-Cash Return. Präzise berechnet nach deutschen Standards.',
    bullets: [
      'Monats- & Jahres-Cashflow',
      'Netto-Rendite & Cash-on-Cash',
      'Loan-to-Value (LTV)',
    ],
    mockup: <KpiMockup />,
  },
  {
    id: 'dashboard',
    label: 'Deal Dashboard',
    headline: 'Deals vergleichen und filtern',
    sub: 'Speichere Objekte und sortiere nach Rendite, Cashflow oder Kaufpreis. Dein Portfolio immer im Überblick.',
    bullets: [
      'Deals speichern & vergleichen',
      'Sortieren nach Rendite oder Cashflow',
      'BrickScore für jeden Deal',
    ],
    mockup: <DashboardMockup />,
  },
]

export default function FeatureSection() {
  const [activeTab, setActiveTab] = useState('url')
  const tab = TABS.find(t => t.id === activeTab)!

  return (
    <section id="features" style={{ padding: '0 0 0', background: '#fff' }}>
      {/* Tab nav */}
      <div style={{ padding: '0 5%', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', gap: 0 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '18px 24px',
              font: `${activeTab === t.id ? '500' : '400'} 14px/1 var(--font-dm-sans), sans-serif`,
              color: activeTab === t.id ? '#0a0a0a' : '#8a8a8a',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === t.id ? '#0a0a0a' : 'transparent'}`,
              cursor: 'pointer',
              transition: 'color 150ms ease, border-color 150ms ease',
              marginBottom: -1,
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        style={{
          padding: '72px 5%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'center',
        }}
      >
        {/* Left: text */}
        <div>
          <h2
            style={{
              margin: '0 0 16px',
              font: '700 clamp(28px, 3vw, 40px)/1.1 var(--font-dm-sans), sans-serif',
              letterSpacing: '-0.025em',
              color: '#0a0a0a',
            }}
          >
            {tab.headline}
          </h2>
          <p
            style={{
              margin: '0 0 28px',
              font: '400 15px/1.6 var(--font-dm-sans), sans-serif',
              color: '#5a5a5a',
              maxWidth: 420,
            }}
          >
            {tab.sub}
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tab.bullets.map((b) => (
              <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#0a0a0a',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span style={{ font: '400 14px/1.4 var(--font-dm-sans)', color: '#4a4a4a' }}>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: mockup */}
        <div>{tab.mockup}</div>
      </div>
    </section>
  )
}
