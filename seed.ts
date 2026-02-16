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
      const paidPlanPriceId = process.env.STRIPE_PAID_PLAN_PRICE_ID
      if (!paidPlanPriceId) {
        throw new Error('STRIPE_PAID_PLAN_PRICE_ID is not set')
      }

      const plans = [
        {
          id: MASTER.getPlanId(MASTER.PLAN.FREE),
          name: MASTER.PLAN.FREE,
          description: '基本的な機能が利用できます',
          price: 0,
          stripePriceId: null,
        },
        {
          id: MASTER.getPlanId(MASTER.PLAN.PAID),
          name: MASTER.PLAN.PAID,
          description: 'すべての機能が利用できます',
          price: 500,
          stripePriceId: paidPlanPriceId,
        },
      ]

      for (const plan of plans) {
        await tx.mPlan.upsert({
          where: { id: plan.id },
          update: {
            name: plan.name,
            description: plan.description,
            price: plan.price,
            stripePriceId: plan.stripePriceId,
          },
          create: plan,
        })
        console.log(`Created/Updated plan: ${plan.name}`)
      }

      // m_modelのマスタデータ
      const models = [
        {
          id: MASTER.getModelId(MASTER.MODEL.GEMINI_2_0_FLASH),
          name: 'Gemini 2.0 Flash',
          description: 'Googleの高速・高品質モデル',
          modelId: MASTER.MODEL.GEMINI_2_0_FLASH,
          provider: 'gemini',
          color: '#4285F4',
          isDefault: true,
        },
        {
          id: MASTER.getModelId(MASTER.MODEL.GEMINI_2_5_FLASH),
          name: 'Gemini 2.5 Flash',
          description: 'Googleの最新高性能モデル',
          modelId: MASTER.MODEL.GEMINI_2_5_FLASH,
          provider: 'gemini',
          color: '#0F9D58',
          isDefault: false,
        },
        {
          id: MASTER.getModelId(MASTER.MODEL.GROQ_LLAMA_3_3_70B),
          name: 'Llama 3.3 70B',
          description: 'Groq高速推論・高性能モデル',
          modelId: MASTER.MODEL.GROQ_LLAMA_3_3_70B,
          provider: 'groq',
          color: '#F55036',
          isDefault: false,
        },
        {
          id: MASTER.getModelId(MASTER.MODEL.GROQ_LLAMA_3_1_8B),
          name: 'Llama 3.1 8B',
          description: 'Groq高速推論・軽量モデル',
          modelId: MASTER.MODEL.GROQ_LLAMA_3_1_8B,
          provider: 'groq',
          color: '#FF8C00',
          isDefault: false,
        },
      ]

      for (const model of models) {
        await tx.mModel.upsert({
          where: { id: model.id },
          update: {
            name: model.name,
            description: model.description,
            modelId: model.modelId,
            provider: model.provider,
            color: model.color,
            isDefault: model.isDefault,
          },
          create: model,
        })
        console.log(`Created/Updated model: ${model.name}`)
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
