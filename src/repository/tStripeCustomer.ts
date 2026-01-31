import type { Prisma, PrismaClient } from '@prisma/client'
import {
  type CreateTStripeCustomerVO,
  TStripeCustomerAggregation,
  TStripeCustomerEntity,
  type TStripeCustomerVO,
} from '../domain/model/tStripeCustomer'
import type { ITStripeCustomerRepository } from '../service/interface/tStripeCustomer'

export class TStripeCustomerRepository implements ITStripeCustomerRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async find(
    tx: Prisma.TransactionClient,
    vo: TStripeCustomerVO
  ): Promise<TStripeCustomerAggregation | null> {
    const user = await tx.tUser.findUnique({
      where: { authId: vo.authId },
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

  async create(
    tx: Prisma.TransactionClient,
    vo: CreateTStripeCustomerVO
  ): Promise<TStripeCustomerEntity> {
    const result = await tx.tStripeCustomer.create({
      data: {
        userId: vo.userId,
        stripeCustomerId: vo.stripeCustomerId,
      },
      select: { id: true, stripeCustomerId: true },
    })

    return new TStripeCustomerEntity(result.id, result.stripeCustomerId)
  }
}
