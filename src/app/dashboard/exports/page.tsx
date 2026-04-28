import type { Metadata } from 'next'
import DashboardShell from '@/components/dashboard/DashboardShell'
import ExportsClient from '@/components/dashboard/ExportsClient'

export const metadata: Metadata = {
  title: 'Meine Exporte — brickscore',
}

export default function ExportsPage() {
  return (
    <DashboardShell>
      <ExportsClient />
    </DashboardShell>
  )
}
