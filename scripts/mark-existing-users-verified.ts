import { prisma } from '../src/lib/prisma'

async function main() {
  const result = await prisma.user.updateMany({
    where: { emailVerified: null },
    data: { emailVerified: new Date() },
  })
  console.log(`Markiert: ${result.count} bestehende User als verified`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => process.exit(process.exitCode ?? 0))
