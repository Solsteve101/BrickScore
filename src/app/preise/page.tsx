import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import FooterSection from '@/components/homepage/FooterSection'
import PricingClient from '@/components/pricing/PricingClient'

export const metadata: Metadata = {
  title: 'Preise — BrickScore',
  description:
    'Einfache, transparente Preise für BrickScore. Kostenlos starten mit 40 Tokens pro Woche, oder upgrade auf Pro und Business für mehr Analysen, kein Wasserzeichen und Team-Funktionen.',
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
