const PENDING_KEY = 'pending_referral_code'
const PENDING_TS_KEY = 'pending_referral_code_ts'
const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 8

export function isValidReferralCode(code: string): boolean {
  if (typeof code !== 'string') return false
  const trimmed = code.trim().toUpperCase()
  if (trimmed.length !== CODE_LENGTH) return false
  for (let i = 0; i < trimmed.length; i++) {
    if (!ALPHABET.includes(trimmed[i])) return false
  }
  return true
}

export function capturePendingReferralCode(rawCode: string): void {
  if (typeof window === 'undefined') return
  const code = rawCode.trim().toUpperCase()
  if (!isValidReferralCode(code)) return
  try {
    window.localStorage.setItem(PENDING_KEY, code)
    window.localStorage.setItem(PENDING_TS_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}

export function getPendingReferralCode(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const code = window.localStorage.getItem(PENDING_KEY)
    const ts = Number(window.localStorage.getItem(PENDING_TS_KEY) ?? 0)
    if (!code || !isValidReferralCode(code)) return null
    if (!ts || Date.now() - ts > TTL_MS) {
      clearPendingReferralCode()
      return null
    }
    return code
  } catch {
    return null
  }
}

export function clearPendingReferralCode(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(PENDING_KEY)
    window.localStorage.removeItem(PENDING_TS_KEY)
  } catch {
    /* ignore */
  }
}

/** POSTs the captured code to the server. Safe to call even if no code is pending. */
export async function claimPendingReferral(): Promise<{ ok: boolean; reason?: string } | null> {
  const code = getPendingReferralCode()
  if (!code) return null
  try {
    const res = await fetch('/api/referral/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; reason?: string }
    clearPendingReferralCode()
    return { ok: !!data.ok, reason: data.reason }
  } catch {
    clearPendingReferralCode()
    return { ok: false, reason: 'network_error' }
  }
}
