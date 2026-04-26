'use client'

import DashboardShell from '@/components/dashboard/DashboardShell'
import Calculator from '@/components/calculator/Calculator'

export default function NewDealPage() {
  return (
    <DashboardShell>
      <div style={{ background: '#ffffff', minHeight: '100vh' }}>
        <Calculator />
      </div>
    </DashboardShell>
  )
}
