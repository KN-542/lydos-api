import { afterAll, afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { UpdateUserVO } from '../domain/model/tUser'
import { MASTER } from '../lib/master'
import { TUserRepository } from './tUser'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_TEST_URL } },
})
const repo = new TUserRepository(prisma)

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

const createUser = (
  suffix: string,
  options: { planId?: number; stripeSubscriptionId?: string } = {}
) =>
  tx.tUser.create({
    data: {
      authId: `tuser-${suffix}`,
      name: '山田太郎',
      email: `tuser-${suffix}@test.com`,
      planId: options.planId ?? MASTER.getPlanId(MASTER.PLAN.FREE),
      stripeSubscriptionId: options.stripeSubscriptionId,
    },
  })

describe('TUserRepository', () => {
  describe('findByAuthId', () => {
    it('存在しない authId の場合は null を返す', async () => {
      const result = await repo.findByAuthId(tx, 'tuser-unknown')
      expect(result).toBeNull()
    })

    it('ユーザーが存在する場合は TUserAggregation を返す', async () => {
      const user = await createUser('1')

      const result = await repo.findByAuthId(tx, user.authId)

      expect(result).not.toBeNull()
      expect(result?.userId).toBe(user.id)
      expect(result?.authId).toBe(user.authId)
      expect(result?.name).toBe(user.name)
      expect(result?.email).toBe(user.email)
      expect(result?.planId).toBe(MASTER.getPlanId(MASTER.PLAN.FREE))
    })

    it('Stripe 顧客未登録の場合は stripeCustomerId / stripeCustomerInternalId が null', async () => {
      const user = await createUser('1')

      const result = await repo.findByAuthId(tx, user.authId)

      expect(result?.stripeCustomerId).toBeNull()
      expect(result?.stripeCustomerInternalId).toBeNull()
    })

    it('Stripe 顧客登録済みの場合は stripeCustomerId / stripeCustomerInternalId を返す', async () => {
      const user = await createUser('1')
      const sc = await tx.tStripeCustomer.create({
        data: { userId: user.id, stripeCustomerId: 'cus_test123' },
      })

      const result = await repo.findByAuthId(tx, user.authId)

      expect(result?.stripeCustomerId).toBe('cus_test123')
      expect(result?.stripeCustomerInternalId).toBe(sc.id)
    })
  })

  describe('update', () => {
    it('planId を更新できる', async () => {
      const user = await createUser('1')
      const paidPlanId = MASTER.getPlanId(MASTER.PLAN.PAID)

      await repo.update(tx, new UpdateUserVO(user.id, { planId: paidPlanId }))

      const updated = await tx.tUser.findUnique({ where: { id: user.id } })
      expect(updated?.planId).toBe(paidPlanId)
    })

    it('name / email / imageUrl を更新できる', async () => {
      const user = await createUser('1')

      await repo.update(
        tx,
        new UpdateUserVO(user.id, {
          name: '鈴木花子',
          email: 'new@test.com',
          imageUrl: 'https://example.com/img.png',
        })
      )

      const updated = await tx.tUser.findUnique({ where: { id: user.id } })
      expect(updated?.name).toBe('鈴木花子')
      expect(updated?.email).toBe('new@test.com')
      expect(updated?.imageUrl).toBe('https://example.com/img.png')
    })

    it('stripeSubscriptionId を更新できる', async () => {
      const user = await createUser('1')

      await repo.update(tx, new UpdateUserVO(user.id, { stripeSubscriptionId: 'sub_abc123' }))

      const updated = await tx.tUser.findUnique({ where: { id: user.id } })
      expect(updated?.stripeSubscriptionId).toBe('sub_abc123')
    })

    it('stripeSubscriptionId に null を設定できる', async () => {
      const user = await createUser('1', { stripeSubscriptionId: 'sub_abc123' })

      await repo.update(tx, new UpdateUserVO(user.id, { stripeSubscriptionId: null }))

      const updated = await tx.tUser.findUnique({ where: { id: user.id } })
      expect(updated?.stripeSubscriptionId).toBeNull()
    })

    it('指定しなかったフィールドは変更されない', async () => {
      const user = await createUser('1')

      await repo.update(tx, new UpdateUserVO(user.id, { name: '鈴木花子' }))

      const updated = await tx.tUser.findUnique({ where: { id: user.id } })
      expect(updated?.email).toBe(user.email)
      expect(updated?.planId).toBe(MASTER.getPlanId(MASTER.PLAN.FREE))
    })
  })
})
