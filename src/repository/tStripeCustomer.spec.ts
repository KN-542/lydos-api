import { afterAll, afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { CreateTStripeCustomerVO } from '../domain/model/tStripeCustomer'
import { MASTER } from '../lib/master'
import { TStripeCustomerRepository } from './tStripeCustomer'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_TEST_URL } },
})
const repo = new TStripeCustomerRepository(prisma)

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

const createUser = (suffix: string) =>
  tx.tUser.create({
    data: {
      authId: `tsc-${suffix}`,
      name: '山田太郎',
      email: `tsc-${suffix}@test.com`,
      planId: MASTER.getPlanId(MASTER.PLAN.FREE),
    },
  })

describe('TStripeCustomerRepository', () => {
  describe('findByAuthId', () => {
    it('存在しない authId の場合は null を返す', async () => {
      const result = await repo.findByAuthId(tx, 'tsc-unknown')
      expect(result).toBeNull()
    })

    it('Stripe 顧客未登録の場合は stripeCustomerId が null', async () => {
      const user = await createUser('1')

      const result = await repo.findByAuthId(tx, user.authId)

      expect(result).not.toBeNull()
      expect(result?.userId).toBe(user.id)
      expect(result?.email).toBe(user.email)
      expect(result?.name).toBe(user.name)
      expect(result?.stripeCustomerId).toBeNull()
    })

    it('Stripe 顧客登録済みの場合は stripeCustomerId を返す', async () => {
      const user = await createUser('1')
      await tx.tStripeCustomer.create({
        data: { userId: user.id, stripeCustomerId: 'cus_test123' },
      })

      const result = await repo.findByAuthId(tx, user.authId)

      expect(result?.stripeCustomerId).toBe('cus_test123')
    })
  })

  describe('create', () => {
    it('Stripe 顧客を作成できる', async () => {
      const user = await createUser('1')

      await repo.create(tx, new CreateTStripeCustomerVO(user.id, 'cus_newcustomer'))

      const result = await repo.findByAuthId(tx, user.authId)
      expect(result?.stripeCustomerId).toBe('cus_newcustomer')
    })

    it('作成後は DB に直接レコードが存在する', async () => {
      const user = await createUser('1')

      await repo.create(tx, new CreateTStripeCustomerVO(user.id, 'cus_verify123'))

      const sc = await tx.tStripeCustomer.findFirst({ where: { userId: user.id } })
      expect(sc?.stripeCustomerId).toBe('cus_verify123')
    })
  })
})
