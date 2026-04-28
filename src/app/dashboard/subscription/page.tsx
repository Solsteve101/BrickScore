import type { Metadata } from 'next'
import DashboardShell from '@/components/dashboard/DashboardShell'
import SubscriptionClient from '@/components/dashboard/SubscriptionClient'

export const metadata: Metadata = {
  title: 'Abonnement — brickscore',
}

export default function SubscriptionPage() {
  return (
    <DashboardShell>
      <SubscriptionClient />
    </DashboardShell>
  )
}
