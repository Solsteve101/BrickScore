import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentDbUser } from '@/lib/db-user'

type Ctx = { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const existing = await prisma.export.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })
  await prisma.export.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
