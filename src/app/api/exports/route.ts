import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentDbUser } from '@/lib/db-user'
import type { SavedExport, ExportFormatKey } from '@/lib/exports-store'

type ExportRow = {
  id: string
  dealId: string | null
  fileName: string
  format: string
  fileData: string | null
  createdAt: Date
}

function fromPrisma(e: ExportRow): SavedExport {
  return {
    export_id: e.id,
    deal_id: e.dealId ?? '',
    format: e.format as ExportFormatKey,
    dateiname: e.fileName,
    datum: e.createdAt.toISOString(),
    daten: e.fileData,
  }
}

export async function GET(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const dealId = url.searchParams.get('dealId')
  const rows = await prisma.export.findMany({
    where: { userId: user.id, ...(dealId ? { dealId } : {}) },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(rows.map(fromPrisma))
}

interface CreateExportBody {
  deal_id?: string | null
  format?: ExportFormatKey
  dateiname?: string
  daten?: string | null
}

export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = (await req.json()) as CreateExportBody
  if (!body || typeof body !== 'object' || !body.format || !body.dateiname) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const created = await prisma.export.create({
    data: {
      userId: user.id,
      dealId: body.deal_id || null,
      fileName: body.dateiname,
      format: body.format,
      fileData: body.daten ?? null,
    },
  })
  return NextResponse.json(fromPrisma(created))
}

export async function DELETE(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const dealId = url.searchParams.get('dealId')
  if (!dealId) return NextResponse.json({ error: 'dealId query param required' }, { status: 400 })
  await prisma.export.deleteMany({ where: { userId: user.id, dealId } })
  return new NextResponse(null, { status: 204 })
}
