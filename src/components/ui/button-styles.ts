import type { CSSProperties } from 'react'

interface ButtonOpts {
  compact?: boolean
  disabled?: boolean
  /** Use on dark backgrounds — secondary becomes transparent w/ white border */
  onDark?: boolean
  /** Override text color (e.g. red for "Löschen") */
  color?: string
  fullWidth?: boolean
}

const FONT = '500 14px/1 var(--font-dm-sans), Inter, sans-serif'
const RADIUS = 10
const PAD = '10px 24px'
const PAD_COMPACT = '8px 16px'

export function primaryButtonStyle(opts: ButtonOpts = {}): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: '#1C1C1C',
    color: opts.color ?? '#FFFFFF',
    border: 'none',
    borderRadius: RADIUS,
    padding: opts.compact ? PAD_COMPACT : PAD,
    font: FONT,
    cursor: opts.disabled ? 'not-allowed' : 'pointer',
    opacity: opts.disabled ? 0.5 : 1,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    width: opts.fullWidth ? '100%' : undefined,
    whiteSpace: 'nowrap',
  }
}

export function secondaryButtonStyle(opts: ButtonOpts = {}): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: opts.onDark ? 'transparent' : '#FFFFFF',
    color: opts.color ?? (opts.onDark ? '#FFFFFF' : '#1C1C1C'),
    border: `1px solid ${opts.onDark ? 'rgba(255,255,255,0.4)' : '#D6D6D4'}`,
    borderRadius: RADIUS,
    padding: opts.compact ? PAD_COMPACT : PAD,
    font: FONT,
    cursor: opts.disabled ? 'not-allowed' : 'pointer',
    opacity: opts.disabled ? 0.5 : 1,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    width: opts.fullWidth ? '100%' : undefined,
    whiteSpace: 'nowrap',
  }
}

/** Hover handler for primary buttons — slight lift via #2C2C2C */
export function primaryHover(e: React.MouseEvent<HTMLElement>): void {
  e.currentTarget.style.background = '#2C2C2C'
}
export function primaryUnhover(e: React.MouseEvent<HTMLElement>): void {
  e.currentTarget.style.background = '#1C1C1C'
}
/** Hover handler for secondary buttons */
export function secondaryHover(e: React.MouseEvent<HTMLElement>): void {
  if (e.currentTarget.dataset.onDark === '1') {
    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
  } else {
    e.currentTarget.style.background = '#F5F5F3'
  }
}
export function secondaryUnhover(e: React.MouseEvent<HTMLElement>): void {
  e.currentTarget.style.background = e.currentTarget.dataset.onDark === '1' ? 'transparent' : '#FFFFFF'
}
