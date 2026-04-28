import type { Metadata } from 'next'
import DashboardShell from '@/components/dashboard/DashboardShell'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const metadata: Metadata = {
  title: 'Meine Deals — brickscore',
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardClient />
    </DashboardShell>
  )
}
