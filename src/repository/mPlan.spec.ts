import { afterAll, afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { MASTER } from '../lib/master'
import { MPlanRepository } from './mPlan'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_TEST_URL } },
})
const repo = new MPlanRepository(prisma)

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

const createUser = (suffix: string, planId: number) =>
  tx.tUser.create({
    data: {
      authId: `mplan-${suffix}`,
      name: 'テストユーザー',
      email: `mplan-${suffix}@test.com`,
      planId,
    },
  })

describe('MPlanRepository', () => {
  describe('findAllByAuthId', () => {
    it('全プランを返す', async () => {
      const plans = await repo.findAllByAuthId(tx, 'mplan-unknown')
      expect(plans.length).toBeGreaterThan(0)
    })

    it('該当ユーザーが存在しない場合、全プランの isSelected は false', async () => {
      const plans = await repo.findAllByAuthId(tx, 'mplan-unknown')
      expect(plans.every((p) => p.isSelected === false)).toBe(true)
    })

    it('ユーザーが無料プランの場合、無料プランのみ isSelected が true', async () => {
      const freePlanId = MASTER.getPlanId(MASTER.PLAN.FREE)
      const user = await createUser('free', freePlanId)

      const plans = await repo.findAllByAuthId(tx, user.authId)
      const freePlan = plans.find((p) => p.id === freePlanId)
      const otherPlans = plans.filter((p) => p.id !== freePlanId)

      expect(freePlan?.isSelected).toBe(true)
      expect(otherPlans.every((p) => p.isSelected === false)).toBe(true)
    })

    it('ユーザーが有料プランの場合、有料プランのみ isSelected が true', async () => {
      const paidPlanId = MASTER.getPlanId(MASTER.PLAN.PAID)
      const user = await createUser('paid', paidPlanId)

      const plans = await repo.findAllByAuthId(tx, user.authId)
      const paidPlan = plans.find((p) => p.id === paidPlanId)
      const otherPlans = plans.filter((p) => p.id !== paidPlanId)

      expect(paidPlan?.isSelected).toBe(true)
      expect(otherPlans.every((p) => p.isSelected === false)).toBe(true)
    })

    it('別ユーザーのプランが自分の isSelected に影響しない', async () => {
      const freePlanId = MASTER.getPlanId(MASTER.PLAN.FREE)
      const paidPlanId = MASTER.getPlanId(MASTER.PLAN.PAID)
      const userA = await createUser('user-a', freePlanId)
      await createUser('user-b', paidPlanId)

      const plans = await repo.findAllByAuthId(tx, userA.authId)
      const freePlan = plans.find((p) => p.id === freePlanId)
      const paidPlan = plans.find((p) => p.id === paidPlanId)

      expect(freePlan?.isSelected).toBe(true)
      expect(paidPlan?.isSelected).toBe(false)
    })
  })
})
