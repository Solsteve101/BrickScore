import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import FooterSection from '@/components/homepage/FooterSection'
import PricingClient from '@/components/pricing/PricingClient'

export const metadata: Metadata = {
  title: 'Preise — brickscore',
  description:
    'Kostenlos starten oder upgraden. Free, Pro und Business Pläne für Immobilien-Investoren. Ab €0/Monat.',
}

export default function PreisePage() {
  return (
    <>
      <Header />
      <main>
        <PricingClient />
      </main>
      <FooterSection />
    </>
  )
}
