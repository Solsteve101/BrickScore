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
    {
      title: 'Altbauwohnung Eimsbüttel',
      loc: 'Hamburg · Hamburg',
      price: '€389.000',
      cashflow: '+€635/Mon',
      saved: '15.04.2026',
      score: 82,
      img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=225&fit=crop',
    },
    {
      title: '2-Zi ETW Kreuzberg',
      loc: 'Berlin · Berlin',
      price: '€425.000',
      cashflow: '+€412/Mon',
      saved: '12.04.2026',
      score: 74,
      img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=225&fit=crop',
    },
    {
      title: 'Dachgeschoss Schwabing',
      loc: 'München · Bayern',
      price: '€590.000',
      cashflow: '+€287/Mon',
      saved: '08.04.2026',
      score: 58,
      img: 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=400&h=225&fit=crop',
    },
  ]
  const scoreBg = (s: number) =>
    s >= 70 ? 'rgba(31,138,101,0.85)' : s >= 40 ? 'rgba(192,133,50,0.85)' : 'rgba(207,45,86,0.85)'

  return (
    <div
      style={{
        background: '#f8f8f8',
        border: '1px solid #e5e5e5',
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div
        style={{
          font: '600 9px/1 var(--font-dm-sans), sans-serif',
          color: '#6F6F6F',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          paddingBottom: 8,
          borderBottom: '1px solid #E6E6E4',
          marginBottom: 10,
        }}
      >
        Meine Deals · 3
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {deals.map((d) => (
          <div
            key={d.title}
            style={{
              background: '#fff',
              border: '1px solid #f0f0f0',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                position: 'relative',
                height: 80,
                background: `url(${d.img}) center/cover no-repeat`,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 6,
                  padding: '2px 6px',
                  borderRadius: 9999,
                  background: scoreBg(d.score),
                  color: '#fff',
                  font: '600 8px/1 var(--font-dm-sans), sans-serif',
                  letterSpacing: 0.1,
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                }}
              >
                Score: {d.score}
              </span>
            </div>

            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div
                style={{
                  font: '600 11px/1.3 var(--font-dm-sans), sans-serif',
                  color: '#1C1C1C',
                  letterSpacing: '-0.1px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {d.title}
              </div>
              <div
                style={{
                  font: '400 9px/1.3 var(--font-dm-sans), sans-serif',
                  color: '#9CA3AF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {d.loc}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 6,
                  marginTop: 4,
                }}
              >
                <span
                  style={{
                    font: '700 13px/1 "JetBrains Mono", monospace',
                    color: '#1C1C1C',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {d.price}
                </span>
                <span
                  style={{
                    font: '600 10px/1 "JetBrains Mono", monospace',
                    color: '#1f8a65',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {d.cashflow}
                </span>
              </div>

              <div
                style={{
                  marginTop: 3,
                  font: '400 8px/1.3 var(--font-dm-sans), sans-serif',
                  color: '#9CA3AF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Gespeichert am {d.saved}
              </div>
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
        className="bs-feature-tab-grid"
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
