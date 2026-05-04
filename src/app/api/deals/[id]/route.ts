import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentDbUser } from '@/lib/db-user'
import type { SavedDeal } from '@/lib/deals-store'

type DealRow = {
  id: string
  title: string
  data: unknown
}

function fromPrisma(d: DealRow): SavedDeal {
  const blob = (d.data ?? {}) as Partial<Omit<SavedDeal, 'id' | 'titel'>>
  return {
    id: d.id,
    titel: d.title,
    link: blob.link ?? '',
    notizen: blob.notizen ?? '',
    bilder: blob.bilder ?? [],
    datum: blob.datum ?? '',
    inputs: blob.inputs as SavedDeal['inputs'],
    kpis: blob.kpis as SavedDeal['kpis'],
  }
}

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const deal = await prisma.deal.findFirst({ where: { id, userId: user.id } })
  if (!deal) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(fromPrisma(deal))
}

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const existing = await prisma.deal.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const patch = (await req.json()) as Partial<Omit<SavedDeal, 'id'>>
  const currentBlob = (existing.data ?? {}) as Partial<Omit<SavedDeal, 'id' | 'titel'>>
  const mergedBlob = {
    link: patch.link ?? currentBlob.link ?? '',
    notizen: patch.notizen ?? currentBlob.notizen ?? '',
    bilder: patch.bilder ?? currentBlob.bilder ?? [],
    datum: patch.datum ?? currentBlob.datum ?? new Date().toISOString(),
    inputs: patch.inputs ?? currentBlob.inputs ?? null,
    kpis: patch.kpis ?? currentBlob.kpis ?? null,
  }

  const updated = await prisma.deal.update({
    where: { id },
    data: {
      title: patch.titel ?? existing.title,
      city: patch.inputs?.city ?? existing.city,
      state: patch.inputs?.state ?? existing.state,
      imageUrl: patch.bilder?.[0] ?? existing.imageUrl,
      score: patch.kpis?.dealScore ?? existing.score,
      data: mergedBlob as Prisma.InputJsonValue,
    },
  })
  return NextResponse.json(fromPrisma(updated))
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const existing = await prisma.deal.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })
  await prisma.deal.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
