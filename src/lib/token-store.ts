import { promises as fs } from 'fs'
import path from 'path'

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

const RESET_PATH = path.join(process.cwd(), 'src', 'data', 'reset-tokens.json')
const EMAIL_PATH = path.join(process.cwd(), 'src', 'data', 'email-tokens.json')

const ONE_HOUR_MS = 60 * 60 * 1000

async function readJson<T>(p: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(p, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed as T[] : []
  } catch {
    return []
  }
}

async function writeJson<T>(p: string, data: T[]): Promise<void> {
  await fs.writeFile(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function isFresh(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() > Date.now()
}

// ─── Reset tokens ──────────────────────────────────────────

export async function createResetToken(userId: string, email: string): Promise<ResetToken> {
  const all = await readJson<ResetToken>(RESET_PATH)
  // Drop expired + any prior tokens for this user
  const cleaned = all.filter((t) => isFresh(t.expiresAt) && t.userId !== userId)
  const created: ResetToken = {
    token: crypto.randomUUID(),
    userId,
    email,
    expiresAt: new Date(Date.now() + ONE_HOUR_MS).toISOString(),
  }
  cleaned.push(created)
  await writeJson(RESET_PATH, cleaned)
  return created
}

export async function consumeResetToken(token: string): Promise<ResetToken | null> {
  const all = await readJson<ResetToken>(RESET_PATH)
  const found = all.find((t) => t.token === token && isFresh(t.expiresAt))
  if (!found) return null
  const remaining = all.filter((t) => t.token !== token && isFresh(t.expiresAt))
  await writeJson(RESET_PATH, remaining)
  return found
}

export async function findResetToken(token: string): Promise<ResetToken | null> {
  const all = await readJson<ResetToken>(RESET_PATH)
  return all.find((t) => t.token === token && isFresh(t.expiresAt)) ?? null
}

// ─── Email change tokens ──────────────────────────────────

export async function createEmailToken(userId: string, newEmail: string): Promise<EmailToken> {
  const all = await readJson<EmailToken>(EMAIL_PATH)
  const cleaned = all.filter((t) => isFresh(t.expiresAt) && t.userId !== userId)
  const created: EmailToken = {
    token: crypto.randomUUID(),
    userId,
    newEmail: newEmail.toLowerCase().trim(),
    expiresAt: new Date(Date.now() + ONE_HOUR_MS).toISOString(),
  }
  cleaned.push(created)
  await writeJson(EMAIL_PATH, cleaned)
  return created
}

export async function consumeEmailToken(token: string): Promise<EmailToken | null> {
  const all = await readJson<EmailToken>(EMAIL_PATH)
  const found = all.find((t) => t.token === token && isFresh(t.expiresAt))
  if (!found) return null
  const remaining = all.filter((t) => t.token !== token && isFresh(t.expiresAt))
  await writeJson(EMAIL_PATH, remaining)
  return found
}
