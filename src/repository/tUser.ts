import type { Prisma, PrismaClient } from '@prisma/client'
import type { ITUserRepository } from '../domain/interface/tUser'
import {
  TUserPlanAggregation,
  type TUserPlanChangeVO,
  type UpdateUserPlanVO,
} from '../domain/model/tUser'

export class TUserRepository implements ITUserRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
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

    if (vo.stripeCustomerInternalId !== null) {
      await tx.tPaymentMethod.updateMany({
        where: { stripeCustomerId: vo.stripeCustomerInternalId },
        data: { isDefault: false },
      })
      await tx.tPaymentMethod.updateMany({
        where: {
          stripeCustomerId: vo.stripeCustomerInternalId,
          stripePaymentMethodId: vo.stripePaymentMethodId,
        },
        data: { isDefault: true },
      })
    }
  }
}
