import type { Prisma, PrismaClient } from '@prisma/client'
import type { IMPlanRepository } from '../domain/interface/mPlan'
import { MPlanEntity } from '../domain/model/mPlan'

export class MPlanRepository implements IMPlanRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // ユーザーのプラン情報取得
  async findAllByAuthId(tx: Prisma.TransactionClient, authId: string): Promise<MPlanEntity[]> {
    const plans = await tx.mPlan.findMany({
      include: {
        _count: {
          select: {
            users: { where: { authId } },
          },
        },
      },
    })

    return plans.map(
      (plan) =>
        new MPlanEntity(plan.id, plan.name, plan.description, plan.price, plan._count.users > 0)
    )
  }
}
