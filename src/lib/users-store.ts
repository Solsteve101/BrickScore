import { promises as fs } from 'fs'
import path from 'path'

export interface StoredUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  passwordHash?: string | null
  provider: 'credentials' | 'google'
  createdAt: string
}

const USERS_PATH = path.join(process.cwd(), 'src', 'data', 'users.json')

async function readAll(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(USERS_PATH, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed as StoredUser[] : []
  } catch {
    return []
  }
}

async function writeAll(users: StoredUser[]): Promise<void> {
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2) + '\n', 'utf8')
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const users = await readAll()
  const norm = email.toLowerCase().trim()
  return users.find((u) => u.email.toLowerCase() === norm) ?? null
}

export async function createUser(user: StoredUser): Promise<void> {
  const users = await readAll()
  users.push(user)
  await writeAll(users)
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const users = await readAll()
  return users.find((u) => u.id === id) ?? null
}

export async function updateUser(id: string, patch: Partial<Pick<StoredUser, 'name' | 'image' | 'passwordHash'>>): Promise<StoredUser | null> {
  const users = await readAll()
  const idx = users.findIndex((u) => u.id === id)
  if (idx < 0) return null
  users[idx] = { ...users[idx], ...patch }
  await writeAll(users)
  return users[idx]
}

export async function deleteUserById(id: string): Promise<boolean> {
  const users = await readAll()
  const next = users.filter((u) => u.id !== id)
  if (next.length === users.length) return false
  await writeAll(next)
  return true
}

export async function upsertGoogleUser(profile: { email: string; name?: string | null; image?: string | null }): Promise<StoredUser> {
  const users = await readAll()
  const norm = profile.email.toLowerCase().trim()
  const existing = users.find((u) => u.email.toLowerCase() === norm)
  if (existing) {
    existing.name = profile.name ?? existing.name ?? null
    existing.image = profile.image ?? existing.image ?? null
    await writeAll(users)
    return existing
  }
  const created: StoredUser = {
    id: crypto.randomUUID(),
    email: norm,
    name: profile.name ?? null,
    image: profile.image ?? null,
    passwordHash: null,
    provider: 'google',
    createdAt: new Date().toISOString(),
  }
  users.push(created)
  await writeAll(users)
  return created
}
