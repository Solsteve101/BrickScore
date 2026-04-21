import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BrickScore — Immobilien-Deals in 30 Sekunden analysiert.',
  description: 'Link einfügen. KPIs sehen. Deal speichern. Ohne Excel, ohne Schätzungen, ohne Umwege.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
