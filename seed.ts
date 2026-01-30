import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  try {
    await prisma.$transaction(async (tx) => {
      // m_planのマスタデータ
      const plans = [
        { id: 1, name: '無料プラン', description: '基本的な機能が利用できます', price: 0 },
        { id: 2, name: '有料プラン', description: 'すべての機能が利用できます', price: 500 },
      ]

      for (const plan of plans) {
        await tx.mPlan.upsert({
          where: { id: plan.id },
          update: { name: plan.name, description: plan.description, price: plan.price },
          create: plan,
        })
        console.log(`Created/Updated plan: ${plan.name}`)
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
