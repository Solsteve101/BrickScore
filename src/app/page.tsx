import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Hero from '@/components/homepage/Hero'
import PortalWall from '@/components/homepage/PortalWall'
import StatsBar from '@/components/homepage/StatsBar'
import FeatureSection from '@/components/homepage/FeatureSection'
import Testimonials from '@/components/homepage/Testimonials'
import TrustStatement from '@/components/homepage/TrustStatement'
import ComparisonTable from '@/components/homepage/ComparisonTable'
import CtaBand from '@/components/homepage/CtaBand'
import FooterSection from '@/components/homepage/FooterSection'
import Calculator from '@/components/calculator/Calculator'

export const metadata: Metadata = {
  title: 'BrickScore — Immobilien Rendite Rechner für Deutschland',
  description:
    'Immobilien Investment Rechner für den deutschen Markt. ImmoScout24-Link einfügen, Kaufnebenkosten berechnen, Cashflow & Mietrendite sofort sehen. Kostenlos starten.',
}

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        {/* 1 · Hero */}
        <Hero />

        {/* 2 · Portal trust strip */}
        <PortalWall />

        {/* 3 · Stats */}
        <StatsBar />

        {/* 4 · Feature tabs */}
        <FeatureSection />

        {/* 5 · Testimonials */}
        <Testimonials />

        {/* 6 · Trust statement */}
        <TrustStatement />

        {/* 7 · Calculator — dark section */}
        <section
          id="calculator"
          style={{
            position: 'relative',
            background: '#0f0f0f',
            padding: '80px 5% 80px',
            overflow: 'hidden',
          }}
        >
          {/* Background depth gradients */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(42,42,42,0.9) 0%, rgba(15,15,15,0) 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 80% -10%, rgba(38,38,38,0.6) 0%, rgba(15,15,15,0) 60%)', pointerEvents: 'none' }} />
          {/* Subtle wave lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <path d="M-100,420 C200,160 400,520 700,280 C850,120 950,360 1100,200" stroke="rgba(255,255,255,0.032)" strokeWidth="1.5" fill="none" />
            <path d="M-100,480 C150,260 450,560 750,360 C900,200 980,440 1100,320" stroke="rgba(255,255,255,0.022)" strokeWidth="1" fill="none" />
            <path d="M-100,100 C300,240 500,60 800,180 C950,240 1020,120 1100,160" stroke="rgba(255,255,255,0.018)" strokeWidth="1" fill="none" />
          </svg>

          <div style={{ position: 'relative', marginBottom: 28, textAlign: 'center' }}>
            <h2
              style={{
                margin: '0 0 12px',
                font: '700 clamp(28px, 3.2vw, 44px)/1.08 var(--font-dm-sans), sans-serif',
                letterSpacing: '-0.025em',
                color: '#f0f0f0',
              }}
            >
              Berechne alles auf einen Blick
            </h2>
            <p
              style={{
                margin: 0,
                font: '400 15px/1 var(--font-dm-sans), sans-serif',
                color: 'rgba(240,240,240,0.45)',
              }}
            >
              Link einfügen oder manuell eingeben — Analyse startet sofort.
            </p>
          </div>

          <div style={{ position: 'relative' }}><div
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                borderRadius: 14,
                background: '#f7f7f7',
                overflow: 'hidden',
              }}
            >
              <div className="v-calc-scroll">
                <Calculator />
              </div>
            </div>
          </div></div>
        </section>

        {/* 8 · Comparison table */}
        <ComparisonTable />

        {/* 9 · CTA band */}
        <CtaBand />
      </main>

      <FooterSection />
    </>
  )
}
