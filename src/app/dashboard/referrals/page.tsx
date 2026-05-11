import type { Metadata } from 'next'
import DashboardShell from '@/components/dashboard/DashboardShell'
import ReferralsClient from '@/components/dashboard/ReferralsClient'

export const metadata: Metadata = {
  title: 'Empfehlungen — brickscore',
}

export default function ReferralsPage() {
  return (
    <DashboardShell>
      <ReferralsClient />
    </DashboardShell>
  )
}
