const OWN_CODE_KEY = 'brickscore_referral_code'
const APPLIED_CODE_KEY = 'brickscore_referral_applied'

function fallbackChars(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 4; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

export function buildOwnReferralCode(userId?: string | null): string {
  if (!userId) return `BRICK-${fallbackChars()}`
  const hex = userId.replace(/-/g, '').toUpperCase()
  const slice = hex.slice(0, 4)
  return `BRICK-${slice.length === 4 ? slice : (slice + fallbackChars()).slice(0, 4)}`
}

/**
 * Returns the user's own referral code, generating + persisting it on first call.
 * Idempotent across renders.
 */
export function getOrCreateOwnReferralCode(userId?: string | null): string {
  if (typeof window === 'undefined') return buildOwnReferralCode(userId)
  try {
    const raw = window.localStorage.getItem(OWN_CODE_KEY)
    if (raw && /^BRICK-[A-Z0-9]{4,}$/.test(raw)) return raw
  } catch { /* ignore */ }
  const code = buildOwnReferralCode(userId)
  try { window.localStorage.setItem(OWN_CODE_KEY, code) } catch { /* ignore */ }
  return code
}

export function getAppliedReferralCode(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(APPLIED_CODE_KEY)
    return raw && raw.length > 0 ? raw : null
  } catch { return null }
}

export function setAppliedReferralCode(code: string): void {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(APPLIED_CODE_KEY, code.trim().toUpperCase()) } catch { /* ignore */ }
}

export function isValidReferralCodeFormat(code: string): boolean {
  return /^BRICK-[A-Z0-9]{4}$/i.test(code.trim())
}
