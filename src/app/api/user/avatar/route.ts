import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentDbUser } from '@/lib/db-user'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024 // 2 MB encoded

interface AvatarBody {
  image?: string
}

export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json({ image: user.image ?? null })
}

export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = (await req.json()) as AvatarBody
  const image = body?.image
  if (typeof image !== 'string' || !image.startsWith('data:image/')) {
    return NextResponse.json({ error: 'invalid_image', message: 'Ungültiges Bildformat.' }, { status: 400 })
  }
  if (image.length > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'too_large', message: 'Bild ist zu groß (max. 2 MB).' }, { status: 413 })
  }
  await prisma.user.update({ where: { id: user.id }, data: { image } })
  return NextResponse.json({ ok: true, image })
}

export async function DELETE() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  await prisma.user.update({ where: { id: user.id }, data: { image: null } })
  return NextResponse.json({ ok: true })
}
