import type { Metadata } from 'next'
import DashboardShell from '@/components/dashboard/DashboardShell'
import SettingsClient from '@/components/dashboard/SettingsClient'

export const metadata: Metadata = {
  title: 'Einstellungen — brickscore',
}

export default function SettingsPage() {
  return (
    <DashboardShell>
      <SettingsClient />
    </DashboardShell>
  )
}
