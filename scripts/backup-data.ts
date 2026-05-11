import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'backups')

  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })

  const dump: Record<string, unknown[]> = {}

  dump.User = await prisma.user.findMany()
  dump.Deal = await prisma.deal.findMany()
  dump.Export = await prisma.export.findMany()
  dump.TokenUsage = await prisma.tokenUsage.findMany()

  const outPath = path.join(backupDir, `data-backup-${timestamp}.json`)
  fs.writeFileSync(outPath, JSON.stringify(dump, null, 2))

  console.log(`Backup geschrieben: ${outPath}`)
  console.log(`Größe: ${(fs.statSync(outPath).size / 1024).toFixed(2)} KB`)
  console.log('Tabellen:')
  for (const [table, rows] of Object.entries(dump)) {
    console.log(`  ${table}: ${rows.length} Zeilen`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
