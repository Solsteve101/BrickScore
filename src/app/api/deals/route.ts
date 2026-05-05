import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentDbUser } from '@/lib/db-user'
import { IMAGE_LIMITS, normalizePlan } from '@/lib/usage-shared'
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

export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const deals = await prisma.deal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(deals.map(fromPrisma))
}

export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = (await req.json()) as Partial<SavedDeal>
  if (!body || typeof body !== 'object' || !body.id) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const plan = normalizePlan(user.plan)
  const incomingImages = body.bilder ?? []
  if (incomingImages.length > IMAGE_LIMITS[plan]) {
    return NextResponse.json(
      { error: 'plan_limit', message: `Plan-Limit erreicht. Maximal ${IMAGE_LIMITS[plan]} Bilder bei ${plan === 'pro' ? 'Pro' : plan === 'business' ? 'Business' : 'Free'}.` },
      { status: 403 },
    )
  }
  const created = await prisma.deal.create({
    data: {
      id: body.id,
      userId: user.id,
      title: body.titel ?? 'Unbenannter Deal',
      city: body.inputs?.city ?? null,
      state: body.inputs?.state ?? null,
      imageUrl: body.bilder?.[0] ?? null,
      score: body.kpis?.dealScore ?? 0,
      data: {
        link: body.link ?? '',
        notizen: body.notizen ?? '',
        bilder: body.bilder ?? [],
        datum: body.datum ?? new Date().toISOString(),
        inputs: body.inputs ?? null,
        kpis: body.kpis ?? null,
      } as Prisma.InputJsonValue,
    },
  })
  return NextResponse.json(fromPrisma(created))
}
