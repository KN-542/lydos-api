import { createClerkClient } from '@clerk/backend'
import { PrismaClient } from '@prisma/client'
import { MASTER } from './src/lib/master'

const prisma = new PrismaClient()
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

async function main() {
  console.log('Start seeding...')

  try {
    await prisma.$transaction(async (tx) => {
      // m_planのマスタデータ
      const plans = [
        {
          id: MASTER.getPlanId(MASTER.PLAN.FREE),
          name: MASTER.PLAN.FREE,
          description: '基本的な機能が利用できます',
          price: 0,
        },
        {
          id: MASTER.getPlanId(MASTER.PLAN.PAID),
          name: MASTER.PLAN.PAID,
          description: 'すべての機能が利用できます',
          price: 500,
        },
      ]

      for (const plan of plans) {
        await tx.mPlan.upsert({
          where: { id: plan.id },
          update: { name: plan.name, description: plan.description, price: plan.price },
          create: plan,
        })
        console.log(`Created/Updated plan: ${plan.name}`)
      }

      // Clerkから認証ユーザー一覧を取得してt_userに登録
      console.log('Fetching users from Clerk...')
      const clerkUsers = await clerkClient.users.getUserList({ limit: 100 })

      for (const clerkUser of clerkUsers.data) {
        const email = clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress
        const name =
          clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.lastName} ${clerkUser.firstName}`
            : clerkUser.username || email || 'Unknown User'

        if (email === undefined) {
          console.warn(`User ${clerkUser.id} has no email address, skipping...`)
          continue
        }

        await tx.tUser.upsert({
          where: { authId: clerkUser.id },
          update: {
            name,
            email,
            imageUrl: clerkUser.imageUrl,
          },
          create: {
            authId: clerkUser.id,
            name,
            email,
            imageUrl: clerkUser.imageUrl,
            planId: MASTER.getPlanId(MASTER.PLAN.FREE), // デフォルトで無料プラン
          },
        })
        console.log(`Created/Updated user: ${name} (${email})`)
      }

      console.log(`Total users synced: ${clerkUsers.data.length}`)
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
