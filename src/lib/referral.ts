import { prisma } from './prisma'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 8
const MAX_GENERATION_ATTEMPTS = 5

export function generateReferralCode(): string {
  let out = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return out
}

export function isValidReferralCode(code: string): boolean {
  if (typeof code !== 'string') return false
  const trimmed = code.trim().toUpperCase()
  if (trimmed.length !== CODE_LENGTH) return false
  for (let i = 0; i < trimmed.length; i++) {
    if (!ALPHABET.includes(trimmed[i])) return false
  }
  return true
}

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  })
  if (existing?.referralCode) return existing.referralCode

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const candidate = generateReferralCode()
    const collision = await prisma.user.findUnique({
      where: { referralCode: candidate },
      select: { id: true },
    })
    if (collision) continue
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: candidate },
        select: { referralCode: true },
      })
      if (updated.referralCode) return updated.referralCode
    } catch {
      // race condition — retry
    }
  }
  throw new Error('referral_code_generation_failed')
}

export interface ClaimResult {
  ok: boolean
  reason?: 'not_found' | 'self_referral' | 'already_referred' | 'invalid_format'
}

export async function claimReferral(currentUserId: string, code: string): Promise<ClaimResult> {
  const normalized = (code ?? '').trim().toUpperCase()
  if (!isValidReferralCode(normalized)) return { ok: false, reason: 'invalid_format' }

  const me = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { id: true, referredByUserId: true },
  })
  if (!me) return { ok: false, reason: 'not_found' }
  if (me.referredByUserId) return { ok: false, reason: 'already_referred' }

  const referrer = await prisma.user.findUnique({
    where: { referralCode: normalized },
    select: { id: true },
  })
  if (!referrer) return { ok: false, reason: 'not_found' }
  if (referrer.id === currentUserId) return { ok: false, reason: 'self_referral' }

  await prisma.user.update({
    where: { id: currentUserId },
    data: { referredByUserId: referrer.id },
  })
  return { ok: true }
}
