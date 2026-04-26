'use client'

import DashboardShell from '@/components/dashboard/DashboardShell'

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div style={{ padding: '36px 40px 60px' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
          <h1 style={{ margin: 0, font: '700 28px/1.2 var(--font-dm-sans), sans-serif', letterSpacing: '-0.6px', color: '#0a0a0a' }}>
            Einstellungen
          </h1>
          <p style={{ margin: 0, font: '400 14.5px/1.5 var(--font-dm-sans), sans-serif', color: '#6a6a6a' }}>
            Konto- und App-Einstellungen.
          </p>
        </header>

        <div style={{
          padding: '40px 28px',
          borderRadius: 14, background: '#ffffff',
          border: '1px dashed #e0e0e0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10,
        }}>
          <span style={{ width: 48, height: 48, borderRadius: 12, background: '#f5f5f3', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#7a7a7a' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.86l.06.07a2 2 0 1 1-2.84 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.86.34l-.07.06A2 2 0 1 1 4.13 16.9l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.86l-.06-.07A2 2 0 1 1 7.1 4.13l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.07-.06A2 2 0 1 1 19.87 7.1l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
          </span>
          <h3 style={{ margin: 0, font: '600 17px/1.3 var(--font-dm-sans), sans-serif', color: '#0a0a0a' }}>
            Bald verfügbar
          </h3>
          <p style={{ margin: 0, maxWidth: 380, font: '400 13.5px/1.5 var(--font-dm-sans), sans-serif', color: '#7a7a7a' }}>
            Hier wirst du dein Profil, Sprache und Benachrichtigungen verwalten können.
          </p>
        </div>
      </div>
    </DashboardShell>
  )
}
