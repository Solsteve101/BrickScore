import { prisma } from './prisma'

const ONE_HOUR_MS = 60 * 60 * 1000
const ONE_DAY_MS = 24 * 60 * 60 * 1000

export interface ResetToken {
  token: string
  userId: string
  email: string
  expiresAt: string // ISO
}

export interface EmailToken {
  token: string
  userId: string
  newEmail: string
  expiresAt: string // ISO
}

export interface SignupToken {
  token: string
  userId: string
  email: string
  expiresAt: string // ISO
}

async function emailToUserId(email: string): Promise<string | null> {
  const u = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  })
  return u?.id ?? null
}

// ─── Reset tokens ──────────────────────────────────────────

export async function createResetToken(userId: string, email: string): Promise<ResetToken> {
  const normalized = email.toLowerCase().trim()

  // Invalidate any prior open reset tokens for this email
  await prisma.verificationToken.updateMany({
    where: { email: normalized, type: 'reset_password', usedAt: null },
    data: { usedAt: new Date() },
  })

  const expiresAt = new Date(Date.now() + ONE_HOUR_MS)
  const created = await prisma.verificationToken.create({
    data: {
      token: crypto.randomUUID(),
      email: normalized,
      type: 'reset_password',
      expiresAt,
    },
  })

  return {
    token: created.token,
    userId,
    email: normalized,
    expiresAt: expiresAt.toISOString(),
  }
}

export async function consumeResetToken(token: string): Promise<ResetToken | null> {
  const tk = await prisma.verificationToken.findUnique({ where: { token } })
  if (!tk) return null
  if (tk.type !== 'reset_password') return null
  if (tk.usedAt) return null
  if (tk.expiresAt.getTime() <= Date.now()) return null

  const userId = await emailToUserId(tk.email)
  if (!userId) return null

  await prisma.verificationToken.update({
    where: { token },
    data: { usedAt: new Date() },
  })

  return {
    token: tk.token,
    userId,
    email: tk.email,
    expiresAt: tk.expiresAt.toISOString(),
  }
}

export async function findResetToken(token: string): Promise<ResetToken | null> {
  const tk = await prisma.verificationToken.findUnique({ where: { token } })
  if (!tk) return null
  if (tk.type !== 'reset_password') return null
  if (tk.usedAt) return null
  if (tk.expiresAt.getTime() <= Date.now()) return null

  const userId = await emailToUserId(tk.email)
  if (!userId) return null

  return {
    token: tk.token,
    userId,
    email: tk.email,
    expiresAt: tk.expiresAt.toISOString(),
  }
}

// ─── Email change tokens ──────────────────────────────────

export async function createEmailToken(userId: string, newEmail: string): Promise<EmailToken> {
  // Look up the user's current email so we can store it for traceability.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  if (!user) throw new Error('user_not_found')

  const currentEmail = user.email.toLowerCase()
  const target = newEmail.toLowerCase().trim()

  // Invalidate prior open change_email tokens for this user
  await prisma.verificationToken.updateMany({
    where: { email: currentEmail, type: 'change_email', usedAt: null },
    data: { usedAt: new Date() },
  })

  const expiresAt = new Date(Date.now() + ONE_HOUR_MS)
  const created = await prisma.verificationToken.create({
    data: {
      token: crypto.randomUUID(),
      email: currentEmail,
      type: 'change_email',
      newEmail: target,
      expiresAt,
    },
  })

  return {
    token: created.token,
    userId,
    newEmail: target,
    expiresAt: expiresAt.toISOString(),
  }
}

export async function consumeEmailToken(token: string): Promise<EmailToken | null> {
  const tk = await prisma.verificationToken.findUnique({ where: { token } })
  if (!tk) return null
  if (tk.type !== 'change_email') return null
  if (tk.usedAt) return null
  if (tk.expiresAt.getTime() <= Date.now()) return null
  if (!tk.newEmail) return null

  const userId = await emailToUserId(tk.email)
  if (!userId) return null

  await prisma.verificationToken.update({
    where: { token },
    data: { usedAt: new Date() },
  })

  return {
    token: tk.token,
    userId,
    newEmail: tk.newEmail,
    expiresAt: tk.expiresAt.toISOString(),
  }
}

// ─── Signup verification tokens ──────────────────────────

export type SignupConsumeError = 'invalid' | 'expired' | 'used'

export async function createSignupToken(userId: string, email: string): Promise<SignupToken> {
  const normalized = email.toLowerCase().trim()

  // Invalidate any prior open signup tokens for this email
  await prisma.verificationToken.updateMany({
    where: { email: normalized, type: 'signup', usedAt: null },
    data: { usedAt: new Date() },
  })

  const expiresAt = new Date(Date.now() + ONE_DAY_MS)
  const created = await prisma.verificationToken.create({
    data: {
      token: crypto.randomUUID(),
      email: normalized,
      type: 'signup',
      expiresAt,
    },
  })

  return {
    token: created.token,
    userId,
    email: normalized,
    expiresAt: expiresAt.toISOString(),
  }
}

/**
 * Consumes a signup token. Returns the SignupToken on success, or a specific
 * error code so the caller can route the user to the right error page.
 */
export async function consumeSignupToken(
  token: string,
): Promise<{ ok: true; data: SignupToken } | { ok: false; reason: SignupConsumeError }> {
  const tk = await prisma.verificationToken.findUnique({ where: { token } })
  if (!tk || tk.type !== 'signup') return { ok: false, reason: 'invalid' }
  if (tk.usedAt) return { ok: false, reason: 'used' }
  if (tk.expiresAt.getTime() <= Date.now()) return { ok: false, reason: 'expired' }

  const userId = await emailToUserId(tk.email)
  if (!userId) return { ok: false, reason: 'invalid' }

  await prisma.verificationToken.update({
    where: { token },
    data: { usedAt: new Date() },
  })

  return {
    ok: true,
    data: {
      token: tk.token,
      userId,
      email: tk.email,
      expiresAt: tk.expiresAt.toISOString(),
    },
  }
}
