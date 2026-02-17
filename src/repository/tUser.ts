import type { Prisma, PrismaClient } from '@prisma/client'
import type { ITUserRepository } from '../domain/interface/tUser'
import { TUserAggregation, type UpdateUserVO } from '../domain/model/tUser'

export class TUserRepository implements ITUserRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // 取得
  async findByAuthId(
    tx: Prisma.TransactionClient,
    authId: string
  ): Promise<TUserAggregation | null> {
    const user = await tx.tUser.findUnique({
      where: { authId },
      select: {
        id: true,
        authId: true,
        name: true,
        email: true,
        imageUrl: true,
        planId: true,
        stripeSubscriptionId: true,
        createdAt: true,
        updatedAt: true,
        stripeCustomer: {
          select: {
            id: true,
            stripeCustomerId: true,
          },
        },
      },
    })
    if (user === null) return null

    return new TUserAggregation(
      user.id,
      user.authId,
      user.name,
      user.email,
      user.imageUrl,
      user.planId,
      user.stripeCustomer?.stripeCustomerId ?? null,
      user.stripeCustomer?.id ?? null,
      user.stripeSubscriptionId ?? null,
      user.createdAt,
      user.updatedAt
    )
  }

  // 更新
  async update(tx: Prisma.TransactionClient, vo: UpdateUserVO): Promise<void> {
    await tx.tUser.update({
      where: { id: vo.userId },
      data: {
        ...(vo.planId !== undefined && { planId: vo.planId }),
        ...(vo.stripeSubscriptionId !== undefined && {
          stripeSubscriptionId: vo.stripeSubscriptionId,
        }),
        ...(vo.name !== undefined && { name: vo.name }),
        ...(vo.email !== undefined && { email: vo.email }),
        ...(vo.imageUrl !== undefined && { imageUrl: vo.imageUrl }),
      },
    })
  }
}
