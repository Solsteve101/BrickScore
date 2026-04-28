import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import AuthSessionProvider from '@/components/providers/SessionProvider'
import ToastContainer from '@/components/toast/ToastContainer'
import { auth } from '@/lib/auth'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://brickscore.de'),
  title: 'brickscore — Immobilien-Investment Analyse',
  description:
    'Immobilien-Inserat einfügen, Rendite berechnen. Cashflow, Netto-Rendite, Cash-on-Cash Return und Deal-Score in 30 Sekunden. Kostenlos starten.',
  keywords: [
    'Immobilien',
    'Investment',
    'Rendite',
    'Cashflow',
    'Analyse',
    'Deal-Score',
    'Immobilien-Rechner',
    'Kapitalanlage',
  ],
  authors: [{ name: 'brickscore' }],
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'brickscore — Immobilien-Investment Analyse',
    description:
      'Immobilien-Inserat einfügen, Rendite berechnen. Cashflow, Netto-Rendite, Cash-on-Cash Return und Deal-Score in 30 Sekunden.',
    url: 'https://brickscore.de',
    siteName: 'brickscore',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'brickscore — Immobilien-Investment Analyse',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'brickscore — Immobilien-Investment Analyse',
    description:
      'Immobilien-Inserat einfügen, Rendite berechnen. Cashflow, Netto-Rendite, Cash-on-Cash Return und Deal-Score in 30 Sekunden.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  return (
    <html lang="de" className={`h-full antialiased ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider session={session}>
          {children}
          <ToastContainer />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
