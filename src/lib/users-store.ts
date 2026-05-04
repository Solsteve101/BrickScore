import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

export interface StoredUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  passwordHash?: string | null
  provider: 'credentials' | 'google'
  createdAt: string
}

type PrismaUserRow = {
  id: string
  email: string
  name: string | null
  image: string | null
  password: string | null
  createdAt: Date
}

// Provider is derived: a Google sign-in upserts the row without a password,
// while a credentials registration always stores a bcrypt hash. There's no
// dedicated provider column on the Prisma User model.
function toStored(u: PrismaUserRow): StoredUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    image: u.image,
    passwordHash: u.password,
    provider: u.password ? 'credentials' : 'google',
    createdAt: u.createdAt.toISOString(),
  }
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const norm = email.toLowerCase().trim()
  const u = await prisma.user.findUnique({ where: { email: norm } })
  return u ? toStored(u) : null
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const u = await prisma.user.findUnique({ where: { id } })
  return u ? toStored(u) : null
}

export async function createUser(user: StoredUser): Promise<void> {
  await prisma.user.create({
    data: {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      name: user.name ?? null,
      image: user.image ?? null,
      password: user.passwordHash ?? null,
    },
  })
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<StoredUser, 'name' | 'image' | 'passwordHash'>>,
): Promise<StoredUser | null> {
  const data: Prisma.UserUpdateInput = {}
  if (patch.name !== undefined) data.name = patch.name
  if (patch.image !== undefined) data.image = patch.image
  if (patch.passwordHash !== undefined) data.password = patch.passwordHash
  try {
    const u = await prisma.user.update({ where: { id }, data })
    return toStored(u)
  } catch {
    return null
  }
}

export async function deleteUserById(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}

export async function updateUserEmail(id: string, newEmail: string): Promise<StoredUser | null> {
  try {
    const u = await prisma.user.update({
      where: { id },
      data: { email: newEmail.toLowerCase().trim() },
    })
    return toStored(u)
  } catch {
    return null
  }
}

export async function upsertGoogleUser(profile: {
  email: string
  name?: string | null
  image?: string | null
}): Promise<StoredUser> {
  const norm = profile.email.toLowerCase().trim()
  // On update, only overwrite name/image if a non-empty value came from the
  // provider — preserves a user-edited name when Google sends a stale value.
  const updateData: Prisma.UserUpdateInput = {}
  if (profile.name) updateData.name = profile.name
  if (profile.image) updateData.image = profile.image

  const u = await prisma.user.upsert({
    where: { email: norm },
    update: updateData,
    create: {
      email: norm,
      name: profile.name ?? null,
      image: profile.image ?? null,
      password: null,
    },
  })
  return toStored(u)
}
