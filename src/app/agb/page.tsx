import type { Metadata } from 'next'
import LegalPageLayout, { H3, P, Stand } from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'AGB — brickscore',
  description: 'Allgemeine Geschäftsbedingungen von brickscore inkl. Widerrufsbelehrung.',
}

export default function AgbPage() {
  return (
    <LegalPageLayout title="Allgemeine Geschäftsbedingungen">
      <H3>§ 1 Geltungsbereich</H3>
      <P>
        Diese AGB gelten für die Nutzung von BrickScore (brickscore.de), betrieben von Tom
        Mund, Lutherstraße 25, 41466 Neuss.
      </P>

      <H3>§ 2 Leistungsbeschreibung</H3>
      <P>
        BrickScore ist ein mathematisches Berechnungstool für Immobilien-Investments.
        Die Plattform führt auf Basis nutzerseitig eingegebener Daten automatisierte
        Berechnungen durch (Cashflow, Rendite, Cash-on-Cash Return etc.).
      </P>

      <H3>§ 3 Keine Beratung — Reiner Rechner</H3>
      <P>
        BrickScore ist ausschließlich ein Rechentool. Die Ergebnisse basieren auf den vom
        Nutzer eingegebenen Daten und mathematischen Formeln. BrickScore stellt ausdrücklich
        KEINE Anlageberatung, Finanzberatung, Steuerberatung oder Rechtsberatung dar. Die
        Plattform gibt keine Empfehlungen zum Kauf oder Verkauf von Immobilien. Der Nutzer
        ist allein verantwortlich für seine Investitionsentscheidungen.
      </P>

      <H3>§ 4 Haftungsausschluss</H3>
      <P>BrickScore übernimmt keinerlei Haftung für:</P>
      <ul style={{ margin: '0 0 16px', paddingLeft: 20, fontSize: 15, lineHeight: 1.7 }}>
        <li style={{ marginBottom: 6 }}>Die Richtigkeit, Vollständigkeit oder Aktualität der berechneten Ergebnisse</li>
        <li style={{ marginBottom: 6 }}>Schäden jeglicher Art, die aus der Nutzung der Plattform entstehen</li>
        <li style={{ marginBottom: 6 }}>Investitionsentscheidungen, die auf Grundlage der Berechnungen getroffen werden</li>
        <li style={{ marginBottom: 6 }}>Die Richtigkeit der automatisch aus Inseraten extrahierten Daten</li>
        <li style={{ marginBottom: 6 }}>Ausfälle oder Unterbrechungen des Dienstes</li>
      </ul>
      <P>
        Die Nutzung erfolgt vollständig auf eigenes Risiko des Nutzers. Dieser
        Haftungsausschluss gilt soweit gesetzlich zulässig.
      </P>

      <H3>§ 5 Nutzerkonto</H3>
      <P>
        Jedes Konto darf nur von einer Person genutzt werden. Der Nutzer ist für seine
        Zugangsdaten verantwortlich.
      </P>

      <H3>§ 6 Tarife, Zahlung und Kündigung</H3>
      <P>
        BrickScore bietet kostenlose (Free) und kostenpflichtige Tarife (Pro, Business).
        Aktuelle Preise unter brickscore.de/preise. Die Zahlung erfolgt über Stripe.
      </P>
      <P>
        Abonnements verlängern sich automatisch um die jeweils gewählte Laufzeit (monatlich
        oder jährlich), sofern nicht rechtzeitig gekündigt wird.
      </P>
      <P>
        Der Nutzer kann sein Abonnement jederzeit kündigen. Die Kündigung wird zum Ende der
        bereits bezahlten Laufzeit wirksam. Bis dahin stehen dem Nutzer alle Funktionen des
        gebuchten Tarifs uneingeschränkt zur Verfügung. Nach Ablauf der bezahlten Laufzeit
        wird das Konto automatisch auf den kostenlosen Tarif (Free) zurückgestuft.
      </P>
      <P>
        Eine Erstattung bereits gezahlter Beträge für die laufende Abrechnungsperiode ist
        ausgeschlossen, sofern gesetzlich nicht anders vorgeschrieben.
      </P>

      <H3>§ 7 Widerrufsrecht</H3>
      <P>
        Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen den
        Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des
        Vertragsschlusses. Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer
        eindeutigen Erklärung (z.B. per E-Mail an brickscore.support@gmail.com) über Ihren
        Entschluss, diesen Vertrag zu widerrufen, informieren.
      </P>
      <P>
        Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die
        Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
      </P>
      <P>
        Folgen des Widerrufs: Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle
        Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen
        vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf
        bei uns eingegangen ist.
      </P>
      <P>
        Haben Sie verlangt, dass die Dienstleistung während der Widerrufsfrist beginnen soll,
        so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem
        Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts unterrichten, bereits
        erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen
        Dienstleistungen entspricht.
      </P>

      <H3>§ 8 Verfügbarkeit</H3>
      <P>Keine Garantie für unterbrechungsfreie Erreichbarkeit.</P>

      <H3>§ 9 Datenschutz</H3>
      <P>Es gilt die Datenschutzerklärung unter brickscore.de/datenschutz.</P>

      <H3>§ 10 Änderungen</H3>
      <P>BrickScore kann diese AGB ändern. Nutzer werden per E-Mail informiert.</P>

      <H3>§ 11 Schlussbestimmungen</H3>
      <P>
        Es gilt deutsches Recht. Unwirksame Bestimmungen berühren die übrigen nicht.
      </P>

      <Stand />
    </LegalPageLayout>
  )
}
