import { afterAll, afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { PlanModelVO } from '../domain/model/mPlanModel'
import { MASTER } from '../lib/master'
import { MPlanModelRepository } from './mPlanModel'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_TEST_URL } },
})
const repo = new MPlanModelRepository(prisma)

let tx: Prisma.TransactionClient
let triggerRollback: () => void

beforeEach(async () => {
  await new Promise<void>((ready) => {
    prisma
      .$transaction(
        async (t) => {
          tx = t
          ready()
          await new Promise<void>((_, reject) => {
            triggerRollback = () => reject(new Error('rollback'))
          })
        },
        { timeout: 30_000 }
      )
      .catch(() => {})
  })
})

afterEach(() => {
  triggerRollback()
})

afterAll(() => prisma.$disconnect())

const freePlanId = MASTER.getPlanId(MASTER.PLAN.FREE)
const paidPlanId = MASTER.getPlanId(MASTER.PLAN.PAID)
const geminiModelId = MASTER.getModelId(MASTER.MODEL.GEMINI_2_0_FLASH)
const groqModelId = MASTER.getModelId(MASTER.MODEL.GROQ_LLAMA_3_3_70B)

describe('MPlanModelRepository', () => {
  describe('find', () => {
    it('無料プランで許可されたモデルは Entity を返す', async () => {
      const result = await repo.find(tx, new PlanModelVO(freePlanId, geminiModelId))

      expect(result).not.toBeNull()
      expect(result?.planId).toBe(freePlanId)
      expect(result?.modelId).toBe(geminiModelId)
    })

    it('有料プランで許可されたモデルは Entity を返す', async () => {
      const result = await repo.find(tx, new PlanModelVO(paidPlanId, groqModelId))

      expect(result).not.toBeNull()
      expect(result?.planId).toBe(paidPlanId)
      expect(result?.modelId).toBe(groqModelId)
    })

    it('無料プランで Groq モデルは null を返す', async () => {
      const result = await repo.find(tx, new PlanModelVO(freePlanId, groqModelId))

      expect(result).toBeNull()
    })

    it('存在しない planId の場合は null を返す', async () => {
      const result = await repo.find(tx, new PlanModelVO(999, geminiModelId))

      expect(result).toBeNull()
    })
  })
})
