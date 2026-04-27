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
  title: 'BrickScore — Immobilien Rendite Rechner für Deutschland',
  description:
    'Immobilien Investment Rechner für den deutschen Markt. ImmoScout24-Link einfügen, Kaufnebenkosten berechnen, Cashflow & Mietrendite sofort sehen. Kostenlos starten.',
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
