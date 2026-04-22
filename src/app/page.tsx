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
            background: '#0f0f0f',
            padding: '80px 5% 80px',
          }}
        >
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
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

          <div
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
          </div>
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
