'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { dismissToast, subscribeToasts, type ToastItem, type ToastVariant } from '@/lib/toast'

interface VariantTheme {
  bg: string
  border: string
  title: string
  body: string
  icon: React.ReactNode
}

const ICON = {
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
}

const THEMES: Record<ToastVariant, VariantTheme> = {
  info:    { bg: '#eff6ff', border: '#3b82f6', title: '#1e3a8a', body: '#1e40af', icon: ICON.info },
  warning: { bg: '#fffbeb', border: '#f59e0b', title: '#78350f', body: '#92400e', icon: ICON.warning },
  success: { bg: '#ecfdf5', border: '#10b981', title: '#065f46', body: '#047857', icon: ICON.success },
  error:   { bg: '#fef2f2', border: '#ef4444', title: '#7f1d1d', body: '#991b1b', icon: ICON.error },
}

export default function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const timers = timersRef.current
    const unsub = subscribeToasts((action) => {
      if (action.type === 'add') {
        const t = action.toast
        setItems((prev) => {
          const filtered = t.key ? prev.filter((p) => p.key !== t.key) : prev
          return [...filtered, t]
        })
        if (!t.persistent) {
          const ms = t.durationMs ?? 6000
          const tm = setTimeout(() => {
            setItems((prev) => prev.filter((p) => p.id !== t.id))
            timers.delete(t.id)
          }, ms)
          timers.set(t.id, tm)
        }
      } else {
        setItems((prev) => prev.filter((p) => p.id !== action.id))
        const tm = timers.get(action.id)
        if (tm) { clearTimeout(tm); timers.delete(action.id) }
      }
    })
    return () => {
      unsub()
      for (const tm of timers.values()) clearTimeout(tm)
      timers.clear()
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 10,
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 40px)',
      }}
    >
      {items.map((t) => (
        <ToastCard key={t.id} item={t} />
      ))}
      <style>{`
        @keyframes bs-toast-slide-in {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function ToastCard({ item }: { item: ToastItem }) {
  const theme = THEMES[item.variant]
  return (
    <div
      role="status"
      style={{
        pointerEvents: 'auto',
        width: 360,
        maxWidth: '100%',
        background: theme.bg,
        borderLeft: `4px solid ${theme.border}`,
        borderRadius: 10,
        boxShadow: '0 10px 28px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)',
        padding: '14px 14px 14px 16px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'flex-start',
        columnGap: 12,
        rowGap: 10,
        animation: 'bs-toast-slide-in 240ms cubic-bezier(0.32, 0.72, 0, 1) both',
      }}
    >
      <span style={{ color: theme.border, marginTop: 1 }}>{theme.icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        {item.title && (
          <strong style={{ font: '600 13.5px/1.35 var(--font-dm-sans), sans-serif', color: theme.title }}>
            {item.title}
          </strong>
        )}
        <span style={{ font: '400 13px/1.5 var(--font-dm-sans), sans-serif', color: theme.body }}>
          {item.message}
        </span>
        {item.action && (
          <Link
            href={item.action.href}
            onClick={() => dismissToast(item.id)}
            style={{
              alignSelf: 'flex-start',
              marginTop: 4,
              padding: '7px 14px',
              borderRadius: 8,
              background: '#0a0a0a',
              color: '#ffffff',
              font: '500 12.5px/1 var(--font-dm-sans), sans-serif',
              textDecoration: 'none',
              border: '1px solid #0a0a0a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
            }}
          >
            {item.action.label}
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismissToast(item.id)}
        aria-label="Schließen"
        style={{
          padding: 4,
          marginTop: -2,
          marginRight: -4,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: theme.body,
          opacity: 0.6,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
