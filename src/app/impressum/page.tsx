import type { Metadata } from 'next'
import LegalPageLayout, { H3, P, Address } from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Impressum — brickscore',
  description: 'Impressum und Anbieterkennzeichnung gemäß § 5 DDG für brickscore.',
}

export default function ImpressumPage() {
  return (
    <LegalPageLayout title="Impressum">
      <P>Angaben gemäß § 5 DDG:</P>

      <Address>
        {`Tom Mund
Lutherstraße 25
41466 Neuss
Deutschland`}
      </Address>

      <P>E-Mail: brickscore.support@gmail.com</P>

      <P>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</P>

      <Address>
        {`Tom Mund
Lutherstraße 25
41466 Neuss
Deutschland`}
      </Address>

      <H3>Haftung für Inhalte</H3>
      <P>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte verantwortlich.
        Nach §§ 8 bis 10 DDG sind wir nicht verpflichtet, fremde Informationen zu überwachen.
        BrickScore führt ausschließlich mathematische Berechnungen auf Basis der vom Nutzer
        eingegebenen Daten durch. Die Ergebnisse stellen keine Anlage-, Steuer- oder
        Rechtsberatung dar. Für Investitionsentscheidungen, die auf Grundlage dieser
        Berechnungen getroffen werden, übernimmt BrickScore keinerlei Haftung.
      </P>

      <H3>Haftung für Links</H3>
      <P>
        Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir
        keinen Einfluss haben.
      </P>

      <H3>Streitschlichtung</H3>
      <P>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </P>

      <H3>Urheberrecht</H3>
      <P>
        Die erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
        Urheberrecht.
      </P>
    </LegalPageLayout>
  )
}
