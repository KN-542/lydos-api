import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  try {
    await prisma.$transaction(async (tx) => {
      // m_siteのマスタデータ
      const sites = [
        { id: 1, name: 'リクナビNEXT' },
        { id: 2, name: 'マイナビ' },
        { id: 3, name: 'DODA' },
        { id: 99, name: 'その他' },
      ]

      for (const site of sites) {
        await tx.mSite.upsert({
          where: { id: site.id },
          update: { name: site.name },
          create: site,
        })
        console.log(`Created/Updated site: ${site.name}`)
      }
    })

    console.log('Seeding finished.')
  } catch (error) {
    console.error('Seeding failed. All changes have been rolled back.')
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
