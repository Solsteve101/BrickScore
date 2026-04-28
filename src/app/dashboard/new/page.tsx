import type { Metadata } from 'next'
import DashboardShell from '@/components/dashboard/DashboardShell'
import Calculator from '@/components/calculator/Calculator'

export const metadata: Metadata = {
  title: 'Neuer Deal — brickscore',
}

export default function NewDealPage() {
  return (
    <DashboardShell>
      <div style={{ background: '#F9F8F6', minHeight: '100vh' }}>
        <Calculator />
      </div>
    </DashboardShell>
  )
}
