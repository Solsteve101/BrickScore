import type { Metadata } from 'next'
import LegalPageLayout, { H3, P, Address, Stand } from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Datenschutz — brickscore',
  description: 'Datenschutzerklärung von brickscore. Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.',
}

export default function DatenschutzPage() {
  return (
    <LegalPageLayout title="Datenschutzerklärung">
      <H3>1. Verantwortlicher</H3>
      <Address>
        {`Tom Mund
Lutherstraße 25
41466 Neuss
Deutschland`}
      </Address>
      <P>E-Mail: brickscore.support@gmail.com</P>

      <H3>2. Welche Daten wir erheben</H3>
      <ul style={{ margin: '0 0 16px', paddingLeft: 20, fontSize: 15, lineHeight: 1.7 }}>
        <li style={{ marginBottom: 6 }}>Bei Registrierung: E-Mail-Adresse, Passwort (verschlüsselt)</li>
        <li style={{ marginBottom: 6 }}>Bei Google-Login: Name und E-Mail von Google (OAuth)</li>
        <li style={{ marginBottom: 6 }}>Server-Logs: IP-Adresse, Browsertyp, Zeitpunkt (nicht personenbezogen zuordenbar)</li>
      </ul>

      <H3>3. Cookies</H3>
      <P>
        Wir verwenden keine Tracking-Cookies und keine Analyse-Tools (kein Google Analytics,
        kein Matomo). Es werden ausschließlich technisch notwendige Session-Cookies für die
        Authentifizierung (Login) verwendet. Rechtsgrundlage: § 25 Abs. 2 TDDDG (technisch
        erforderliche Speicherung).
      </P>

      <H3>4. Datenspeicherung</H3>
      <P>
        Ihre Immobilien-Analysen und Deals werden lokal in Ihrem Browser (localStorage)
        gespeichert. Diese Daten verlassen Ihren Browser nicht.
      </P>

      <H3>5. Externe Dienste</H3>
      <ul style={{ margin: '0 0 16px', paddingLeft: 20, fontSize: 15, lineHeight: 1.7 }}>
        <li style={{ marginBottom: 8 }}>
          <strong>Stripe (Zahlungsabwicklung):</strong> Stripe Inc., USA. BrickScore speichert
          keine Zahlungsdaten. Stripes Datenschutz: stripe.com/de/privacy. Rechtsgrundlage:
          Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
        </li>
        <li style={{ marginBottom: 8 }}>
          <strong>Google OAuth (Login):</strong> Nur Name und E-Mail werden übermittelt.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
        </li>
        <li style={{ marginBottom: 8 }}>
          <strong>Anthropic Claude API (Inserat-Analyse):</strong> Inseratsinhalte werden zur
          Datenextraktion übermittelt. Keine personenbezogenen Daten. Rechtsgrundlage: Art. 6
          Abs. 1 lit. b DSGVO (Vertragserfüllung).
        </li>
        <li style={{ marginBottom: 8 }}>
          <strong>Firecrawl (Web Scraping):</strong> Nur die Inserat-URL wird übermittelt.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
        </li>
        <li style={{ marginBottom: 8 }}>
          <strong>Resend (E-Mail-Versand):</strong> Für Passwort-Reset und E-Mail-Änderung.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
        </li>
      </ul>

      <H3>6. Ihre Rechte (nach DSGVO)</H3>
      <P>
        Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch.
        Kontakt: brickscore.support@gmail.com. Beschwerderecht bei der zuständigen
        Aufsichtsbehörde.
      </P>

      <Stand />
    </LegalPageLayout>
  )
}
