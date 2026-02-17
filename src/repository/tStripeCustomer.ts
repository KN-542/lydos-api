import type { Prisma, PrismaClient } from '@prisma/client'
import type { ITStripeCustomerRepository } from '../domain/interface/tStripeCustomer'
import {
  type CreateTStripeCustomerVO,
  TStripeCustomerAggregation,
} from '../domain/model/tStripeCustomer'

export class TStripeCustomerRepository implements ITStripeCustomerRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // Stripe顧客取得
  async findByAuthId(
    tx: Prisma.TransactionClient,
    authId: string
  ): Promise<TStripeCustomerAggregation | null> {
    const user = await tx.tUser.findUnique({
      where: { authId },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomer: {
          select: {
            stripeCustomerId: true,
          },
        },
      },
    })
    if (user === null) return null

    return new TStripeCustomerAggregation(
      user.id,
      user.email,
      user.name,
      user.stripeCustomer?.stripeCustomerId ?? null
    )
  }

  // Stripe顧客作成
  async create(tx: Prisma.TransactionClient, vo: CreateTStripeCustomerVO): Promise<void> {
    await tx.tStripeCustomer.create({
      data: {
        userId: vo.userId,
        stripeCustomerId: vo.stripeCustomerId,
      },
    })
  }
}
