import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function maskEmail(email: string | null): string {
  if (!email) return '—'
  const at = email.indexOf('@')
  if (at <= 1) return email
  return `${email[0]}${'*'.repeat(Math.max(at - 1, 1))}${email.slice(at)}`
}

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      email: true,
      referralCode: true,
      referredByUserId: true,
      createdAt: true,
    },
  })
  console.log('--- 10 NEUESTE USER (sortiert nach createdAt DESC) ---')
  for (const u of users) {
    console.log(JSON.stringify({
      id: u.id,
      email: maskEmail(u.email),
      referralCode: u.referralCode,
      referredByUserId: u.referredByUserId,
      createdAt: u.createdAt.toISOString(),
    }))
  }

  const fidelio = await prisma.user.findFirst({
    where: { email: '011fidelio@gmail.com' },
    select: { id: true, email: true, referralCode: true, createdAt: true },
  })
  console.log('\n--- 011fidelio@gmail.com ---')
  console.log(JSON.stringify({
    found: !!fidelio,
    id: fidelio?.id,
    referralCode: fidelio?.referralCode,
    createdAt: fidelio?.createdAt.toISOString(),
  }))

  const creditCount = await prisma.referralCredit.count()
  console.log(`\n--- ReferralCredits in DB: ${creditCount} ---`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
