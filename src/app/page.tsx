import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Hero from '@/components/homepage/Hero'
import PortalWall from '@/components/homepage/PortalWall'
import FeatureUrlImport from '@/components/homepage/FeatureUrlImport'
import FeatureKpis from '@/components/homepage/FeatureKpis'
import FeaturePortfolio from '@/components/homepage/FeaturePortfolio'
import Testimonials from '@/components/homepage/Testimonials'
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
        <Hero />
        <PortalWall />

        {/* Calculator stage */}
        <div
          id="calculator"
          style={{
            position: 'relative',
            padding: '8px 5% 24px',
          }}
        >
          <div
            style={{
              position: 'relative',
              padding: 10,
              borderRadius: 20,
              background: 'linear-gradient(180deg, rgba(38,37,30,0.04) 0%, rgba(38,37,30,0) 100%)',
              boxShadow: '0 40px 90px rgba(38,37,30,0.12), 0 16px 40px rgba(38,37,30,0.08)',
            }}
          >
            <div
              style={{
                borderRadius: 14,
                background: '#f2f1ed',
                boxShadow: '0 0 0 1px rgba(38,37,30,0.08)',
                overflow: 'hidden',
              }}
            >
              <div className="v-calc-scroll">
                <Calculator />
              </div>
            </div>
          </div>
        </div>

        <FeatureUrlImport />
        <FeatureKpis />
        <FeaturePortfolio />
        <Testimonials />
        <CtaBand />
      </main>

      <FooterSection />
    </>
  )
}
