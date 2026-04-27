'use client'

import DashboardShell from '@/components/dashboard/DashboardShell'
import UsageClient from '@/components/dashboard/UsageClient'

export default function UsagePage() {
  return (
    <DashboardShell>
      <UsageClient />
    </DashboardShell>
  )
}
