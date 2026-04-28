import type { Metadata } from 'next'
import DashboardShell from '@/components/dashboard/DashboardShell'
import UsageClient from '@/components/dashboard/UsageClient'

export const metadata: Metadata = {
  title: 'Nutzung — brickscore',
}

export default function UsagePage() {
  return (
    <DashboardShell>
      <UsageClient />
    </DashboardShell>
  )
}
