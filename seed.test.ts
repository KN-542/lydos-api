import { PrismaClient } from '@prisma/client'
import { MASTER } from './src/lib/master'

// テスト用DB (DATABASE_TEST_URL) にマスタデータのみ投入する
// Clerk・Stripe への依存はなく、テスト実行前に一度だけ実行すればよい
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_TEST_URL } },
})

async function main() {
  console.log('Start seeding master data for test DB...')

  await prisma.$transaction(async (tx) => {
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
        stripePriceId: null,
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
  })

  console.log('Test DB seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
