import { afterAll, afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { MASTER } from '../lib/master'
import { MModelRepository } from './mModel'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_TEST_URL } },
})
const repo = new MModelRepository(prisma)

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

const createUser = (suffix: string, planId = freePlanId) =>
  tx.tUser.create({
    data: {
      authId: `mmodel-${suffix}`,
      name: '山田太郎',
      email: `mmodel-${suffix}@test.com`,
      planId,
    },
  })

describe('MModelRepository', () => {
  describe('findAllByAuthId', () => {
    it('無料プランのユーザーは Gemini モデルのみ返す', async () => {
      const user = await createUser('free', freePlanId)

      const models = await repo.findAllByAuthId(tx, user.authId)

      expect(models.length).toBe(2)
      expect(models.every((m) => m.provider === 'gemini')).toBe(true)
    })

    it('有料プランのユーザーは全モデルを返す', async () => {
      const user = await createUser('paid', paidPlanId)

      const models = await repo.findAllByAuthId(tx, user.authId)

      expect(models.length).toBe(4)
      expect(models.some((m) => m.provider === 'groq')).toBe(true)
    })

    it('id 昇順で返す', async () => {
      const user = await createUser('order', paidPlanId)

      const models = await repo.findAllByAuthId(tx, user.authId)

      expect(models[0].id).toBe(MASTER.getModelId(MASTER.MODEL.GEMINI_2_0_FLASH))
      expect(models[1].id).toBe(MASTER.getModelId(MASTER.MODEL.GEMINI_2_5_FLASH))
      expect(models[2].id).toBe(MASTER.getModelId(MASTER.MODEL.GROQ_LLAMA_3_3_70B))
      expect(models[3].id).toBe(MASTER.getModelId(MASTER.MODEL.GROQ_LLAMA_3_1_8B))
    })

    it('返却値は MModelEntity のプロパティを持つ', async () => {
      const user = await createUser('props', freePlanId)

      const models = await repo.findAllByAuthId(tx, user.authId)
      const first = models[0]

      expect(first.name).toBe('Gemini 2.0 Flash')
      expect(first.modelId).toBe(MASTER.MODEL.GEMINI_2_0_FLASH)
      expect(first.provider).toBe('gemini')
      expect(first.color).toBe('#4285F4')
      expect(first.isDefault).toBe(true)
    })

    it('存在しない authId の場合は空配列を返す', async () => {
      const models = await repo.findAllByAuthId(tx, 'mmodel-nonexistent')
      expect(models).toEqual([])
    })
  })

  describe('find', () => {
    it('存在する id を指定した場合は該当モデルを返す', async () => {
      const id = MASTER.getModelId(MASTER.MODEL.GEMINI_2_0_FLASH)

      const model = await repo.find(tx, id)

      expect(model).not.toBeNull()
      expect(model?.id).toBe(id)
      expect(model?.name).toBe('Gemini 2.0 Flash')
    })

    it('存在しない id を指定した場合は null を返す', async () => {
      const model = await repo.find(tx, 9999)
      expect(model).toBeNull()
    })
  })
})
