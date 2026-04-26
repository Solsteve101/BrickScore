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
        <StatsBar />
        <FeatureSection />
        <Testimonials />
        <TrustStatement />
        <ComparisonTable />
        <CtaBand />
      </main>

      <FooterSection />
    </>
  )
}
