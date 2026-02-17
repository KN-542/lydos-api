import type { Prisma, PrismaClient } from '@prisma/client'
import type { ITUserRepository } from '../domain/interface/tUser'
import {
  TUserEntity,
  TUserPlanAggregation,
  type TUserPlanChangeVO,
  type UpdateUserPlanVO,
} from '../domain/model/tUser'

export class TUserRepository implements ITUserRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async findByAuthId(tx: Prisma.TransactionClient, authId: string): Promise<TUserEntity | null> {
    const user = await tx.tUser.findUnique({
      where: { authId },
      select: {
        id: true,
        authId: true,
        name: true,
        email: true,
        imageUrl: true,
        planId: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (user === null) return null
    return new TUserEntity(
      user.id,
      user.authId,
      user.name,
      user.email,
      user.imageUrl,
      user.planId,
      user.createdAt,
      user.updatedAt
    )
  }

  async findForPlanChange(
    tx: Prisma.TransactionClient,
    vo: TUserPlanChangeVO
  ): Promise<TUserPlanAggregation | null> {
    const user = await tx.tUser.findUnique({
      where: { authId: vo.authId },
      select: {
        id: true,
        planId: true,
        stripeSubscriptionId: true,
        stripeCustomer: {
          select: {
            id: true,
            stripeCustomerId: true,
          },
        },
      },
    })
    if (user === null) return null

    return new TUserPlanAggregation(
      user.id,
      user.planId,
      user.stripeCustomer?.stripeCustomerId ?? null,
      user.stripeCustomer?.id ?? null,
      user.stripeSubscriptionId ?? null
    )
  }

  async updatePlan(tx: Prisma.TransactionClient, vo: UpdateUserPlanVO): Promise<void> {
    await tx.tUser.update({
      where: { id: vo.userId },
      data: { planId: vo.planId, stripeSubscriptionId: vo.stripeSubscriptionId },
    })
  }
}
