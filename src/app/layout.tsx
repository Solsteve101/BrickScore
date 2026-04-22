import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'BrickScore — Immobilien Rendite Rechner für Deutschland',
  description:
    'Immobilien Investment Rechner für den deutschen Markt. ImmoScout24-Link einfügen, Kaufnebenkosten berechnen, Cashflow & Mietrendite sofort sehen. Kostenlos starten.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`h-full antialiased ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
