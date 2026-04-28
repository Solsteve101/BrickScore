import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Kontakt — brickscore',
  description: 'Kontaktiere das brickscore Team. Fragen, Feedback oder Support-Anfragen.',
}

export default function KontaktLayout({ children }: { children: ReactNode }) {
  return children
}
