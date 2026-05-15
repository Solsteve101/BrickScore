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
  openGraph: {
    type: 'website',
    url: '/',
    title: 'brickscore — Immobilien-Investment Analyse',
    description: 'Immobilien-Inserat einfügen, Rendite berechnen. Cashflow, Nettorendite, Cash-on-Cash Return und Deal Score in 30 Sekunden.',
    siteName: 'brickscore',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'brickscore Logo',
      },
    ],
    locale: 'de_DE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'brickscore — Immobilien-Investment Analyse',
    description: 'Immobilien-Inserat einfügen, Rendite berechnen. Cashflow, Nettorendite, Cash-on-Cash Return und Deal Score in 30 Sekunden.',
    images: ['/og-image.png'],
  },
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
